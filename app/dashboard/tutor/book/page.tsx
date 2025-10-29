'use client';

import * as React from 'react';
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Clock, CalendarDays, Trash2 } from 'lucide-react';
import { setTutorSlots } from '@/services/availability';
import { toast } from '@/hooks/use-toast';

export default function TutorBookingFlow() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<
    { startTime: string; endTime: string; slotType: 'demo' | 'regular' }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [slotType, setSlotType] = useState<'demo' | 'regular'>('demo');
  const { user, logout } = useAuth();

  // ✅ Add slot to temporary list
  const handleAddSlot = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Missing Selection',
        description: 'Please select both date and time before adding a slot.',
      });
      return;
    }

    const start = selectedDate
      .hour(selectedTime.hour())
      .minute(selectedTime.minute())
      .second(0);

    const end = start.add(slotType === 'demo' ? 15 : 30, 'minute'); // ⏱️ Demo = 15 mins

    const newSlot = {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      slotType,
    };

    // Prevent duplicates
    const alreadyExists = slots.some(
      (slot) => slot.startTime === newSlot.startTime && slot.slotType === newSlot.slotType
    );
    if (alreadyExists) {
      toast({
        title: 'Duplicate Slot',
        description: 'This slot is already added for this type.',
      });
      return;
    }

    setSlots([...slots, newSlot]);
    toast({
      title: 'Added!',
      description: `${slotType === 'demo' ? 'Demo' : 'Regular'} slot on ${start.format(
        'MMM D, h:mm A'
      )} added.`,
    });
    setSelectedTime(null);
  };

  // ✅ Remove slot
  const handleRemoveSlot = (index: number) => {
    const updated = [...slots];
    updated.splice(index, 1);
    setSlots(updated);
  };

  // ✅ Save all slots at once
  const handleConfirm = async () => {
    if (slots.length === 0) {
      toast({
        title: 'No Slots',
        description: 'Please add at least one slot before saving.',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await setTutorSlots(slots); // backend now expects { startTime, endTime, slotType }

      toast({
        title: 'Slots Saved',
        description: res?.message || `${slots.length} slot(s) saved successfully.`,
      });

      setSlots([]);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Failed to Save',
        description: err?.response?.data?.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={3}
        userRole="tutor"
        onLogout={logout}
      />

      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Create Availability Slots"
          subtitle="Select multiple dates and times to set your availability for demo or regular classes"
        />

        <main className="p-6 space-y-6">
          <Card className="p-6 rounded-2xl shadow-soft bg-white space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Choose Date & Time
              </h2>

              {/* Slot Type Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                <button
                  onClick={() => setSlotType('demo')}
                  className={`px-4 py-2 text-sm font-medium ${
                    slotType === 'demo'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Demo (15 min)
                </button>
                <button
                  onClick={() => setSlotType('regular')}
                  className={`px-4 py-2 text-sm font-medium ${
                    slotType === 'regular'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Regular (30 min)
                </button>
              </div>
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="grid md:grid-cols-2 gap-10">
                {/* Date Picker */}
                <div className="flex flex-col items-center">
                  <StaticDatePicker
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    displayStaticWrapperAs="desktop"
                  />
                </div>

                {/* Time Picker */}
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-primary" /> Choose Time
                  </h3>
                  <StaticTimePicker
                    orientation="landscape"
                    value={selectedTime}
                    onChange={(newValue) => setSelectedTime(newValue)}
                  />
                  <Button
                    onClick={handleAddSlot}
                    disabled={!selectedDate || !selectedTime}
                    className="mt-4 bg-primary text-white hover:bg-primary/90"
                  >
                    Add {slotType === 'demo' ? 'Demo' : 'Regular'} Slot
                  </Button>
                </div>
              </div>
            </LocalizationProvider>

            {/* Selected Slots */}
            {slots.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Selected Slots</h3>
                <ul className="space-y-2">
                  {slots.map((slot, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <span className="block font-medium text-gray-800">
                          {dayjs(slot.startTime).format('MMM D, YYYY h:mm A')} -{' '}
                          {dayjs(slot.endTime).format('h:mm A')}
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase ${
                            slot.slotType === 'demo' ? 'text-green-600' : 'text-blue-600'
                          }`}
                        >
                          {slot.slotType === 'demo' ? 'Demo Slot' : 'Regular Slot'}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSlot(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleConfirm}
                disabled={slots.length === 0 || loading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {loading
                  ? 'Saving…'
                  : `Save ${slots.length} Slot${slots.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
