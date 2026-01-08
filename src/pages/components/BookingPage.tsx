import { useState, useEffect } from "react";
import { supabase } from "../../libs/supabaseClient";
import { toast } from "react-hot-toast";

interface RoomType {
  id: number;
  label: string;
  price: number;
  capacity?: string;
  icon?: string;
}

interface Equipment {
  id: number;
  label: string;
  price: number;
  icon?: string;
}

interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface BookingForm {
  selectedRoomType: number;
  reservationDate: string;
  timeSlot: string;
  durationHours: number;
  selectedEquipments: number[];
  notes?: string;
}

// Added interface for Supabase Booking response
interface BookedSlotResponse {
  start_time: string;
  end_time: string;
}

export default function BookingPage() {
  const [formData, setFormData] = useState<BookingForm>({
    selectedRoomType: 0,
    reservationDate: "",
    timeSlot: "",
    durationHours: 1,
    selectedEquipments: [],
    notes: "",
  });

  const [cart, setCart] = useState<FoodItem[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [bookedSlots, setBookedSlots] = useState<
    { start: string; end: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchEquipments();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from("spaces").select("*");
    if (error) return toast.error("Failed to load rooms");
    setRooms(data as RoomType[]);
  };

  const fetchEquipments = async () => {
    const { data, error } = await supabase.from("equipments").select("*");
    if (error) return toast.error("Failed to load equipments");
    setEquipments(data as Equipment[]);
  };

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.selectedRoomType || !formData.reservationDate)
        return setBookedSlots([]);

      const startOfDay = new Date(formData.reservationDate + "T00:00:00");
      const endOfDay = new Date(formData.reservationDate + "T23:59:59");

      const { data, error } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("space_id", formData.selectedRoomType)
        .gte("start_time", startOfDay.toISOString())
        .lte("end_time", endOfDay.toISOString());

      if (error) return toast.error("Failed to fetch booked slots");

      // FIX: Typed 'b' as BookedSlotResponse to replace 'any'
      setBookedSlots(
        ((data as unknown as BookedSlotResponse[]) || []).map((b) => ({
          start: b.start_time,
          end: b.end_time,
        }))
      );
    };

    fetchBookedSlots();
  }, [formData.selectedRoomType, formData.reservationDate]);

  const isTimeAvailable = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const selectedDate = new Date(formData.reservationDate);
    selectedDate.setHours(hours, minutes, 0, 0);
    const endTime = new Date(
      selectedDate.getTime() + formData.durationHours * 60 * 60 * 1000
    );
    return !bookedSlots.some(
      (slot) =>
        new Date(slot.start) < endTime && new Date(slot.end) > selectedDate
    );
  };

  const calculateTotal = () => {
    const room = rooms.find((r) => r.id === formData.selectedRoomType);
    const roomCost = room ? room.price * formData.durationHours : 0;
    const equipmentCost = formData.selectedEquipments.reduce((sum, eqId) => {
      const eq = equipments.find((e) => e.id === eqId);
      return eq ? sum + eq.price : sum;
    }, 0);
    const foodCost = cart.reduce((sum, f) => sum + f.price * f.quantity, 0);
    return roomCost + equipmentCost + foodCost;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error("Please log in first.");
      const userId = userData.user.id;

      const room = rooms.find((r) => r.id === formData.selectedRoomType);
      if (!room) throw new Error("Please select a valid room");

      const startTime = new Date(
        `${formData.reservationDate}T${formData.timeSlot}:00`
      );
      const endTime = new Date(
        startTime.getTime() + formData.durationHours * 60 * 60 * 1000
      );

      if (!isTimeAvailable(formData.timeSlot))
        throw new Error("Selected time is already booked.");

      // Insert booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          space_id: room.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: formData.durationHours,
          notes: formData.notes,
          total_amount: calculateTotal(),
        })
        .select()
        .single();

      if (bookingError || !booking)
        throw bookingError ?? new Error("Booking failed");

      // Insert equipments
      if (formData.selectedEquipments.length) {
        const equipmentInserts = formData.selectedEquipments.map((eqId) => ({
          booking_id: booking.id,
          equipment_id: eqId,
        }));
        await supabase.from("booking_equipments").insert(equipmentInserts);
      }

      // Insert food orders
      if (cart.length) {
        const foodInserts = cart.map((f) => ({
          booking_id: booking.id,
          name: f.name,
          price: f.price,
          quantity: f.quantity,
        }));
        await supabase.from("food_orders").insert(foodInserts);
      }

      toast.success("Booking confirmed!");
      setFormData({
        selectedRoomType: 0,
        reservationDate: "",
        timeSlot: "",
        durationHours: 1,
        selectedEquipments: [],
        notes: "",
      });
      setCart([]);
    } catch (err) {
      // FIX: Safe error handling without 'any'
      const errorMessage =
        err instanceof Error ? err.message : "Booking failed.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <h1>Book a Room</h1>

      <label>Room</label>
      <select
        value={formData.selectedRoomType}
        onChange={(e) =>
          setFormData({ ...formData, selectedRoomType: Number(e.target.value) })
        }
      >
        <option value={0}>Select a room</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.label} - ${room.price}/hr
          </option>
        ))}
      </select>

      <label>Date</label>
      <input
        type="date"
        value={formData.reservationDate}
        onChange={(e) =>
          setFormData({ ...formData, reservationDate: e.target.value })
        }
      />

      <label>Time</label>
      <input
        type="time"
        value={formData.timeSlot}
        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
        list="available-times"
      />
      <datalist id="available-times">
        {Array.from({ length: 24 }).flatMap((_, hour) =>
          [0, 30].map((minute) => {
            const timeStr = `${hour.toString().padStart(2, "0")}:${minute
              .toString()
              .padStart(2, "0")}`;
            return isTimeAvailable(timeStr) ? (
              <option key={timeStr} value={timeStr} />
            ) : null;
          })
        )}
      </datalist>

      <label>Duration (hours)</label>
      <input
        type="number"
        value={formData.durationHours}
        min={1}
        onChange={(e) =>
          setFormData({ ...formData, durationHours: Number(e.target.value) })
        }
      />

      <label>Equipments</label>
      <div className="equipments">
        {equipments.map((eq) => (
          <label key={eq.id}>
            <input
              type="checkbox"
              value={eq.id}
              checked={formData.selectedEquipments.includes(eq.id)}
              onChange={() => {
                const selected = formData.selectedEquipments.includes(eq.id);
                setFormData({
                  ...formData,
                  selectedEquipments: selected
                    ? formData.selectedEquipments.filter((id) => id !== eq.id)
                    : [...formData.selectedEquipments, eq.id],
                });
              }}
            />
            {eq.label} (${eq.price})
          </label>
        ))}
      </div>

      <label>Notes</label>
      <textarea
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />

      <label>Food Orders</label>
      <div className="cart">
        {cart.map((f) => (
          <div key={f.id}>
            {f.name} x{f.quantity} - ${f.price * f.quantity}
          </div>
        ))}
      </div>

      <h3>Total: ${calculateTotal()}</h3>

      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Confirm Booking"}
      </button>
    </div>
  );
}
