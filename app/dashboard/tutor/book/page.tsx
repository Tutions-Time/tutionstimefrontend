'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
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
import { setTutorSlots, getMySlots, deleteSlot, Slot } from '@/services/availability';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TutorBookingFlow() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<
    { startTime: string; endTime: string; slotType: 'demo' | 'regular' }[]
  >([]);
  const [mySlots, setMySlots] = useState<Slot[]>([]);
  const [slotType, setSlotType] = useState<'demo' | 'regular'>('demo');
  const [filterType, setFilterType] = useState<'all' | 'demo' | 'regular'>('all');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { logout } = useAuth();

  // 🟢 Fetch My Slots
  useEffect(() => {
    fetchMySlots();
  }, []);

  const fetchMySlots = async () => {
    try {
      setFetching(true);
      const data = await getMySlots();
      setMySlots(data);
    } catch {
      toast({ title: 'Error', description: 'Could not fetch your slots.' });
    } finally {
      setFetching(false);
    }
  };

  // 🟢 Add slot (with validations)
  const handleAddSlot = () => {
    if (!selectedDate || !startTime) {
      toast({ title: 'Missing Selection', description: 'Please select date and start time.' });
      return;
    }

    const start = selectedDate
      .hour(startTime.hour())
      .minute(startTime.minute())
      .second(0);

    // ⏳ Past time validation
    if (start.isBefore(dayjs())) {
      toast({ title: 'Invalid Time', description: 'You cannot add a slot in the past.' });
      return;
    }

    // 📅 Date limit (max 60 days ahead)
    const daysAhead = dayjs(selectedDate).diff(dayjs(), 'days');
    if (daysAhead < 0 || daysAhead > 60) {
      toast({
        title: 'Invalid Date',
        description: 'Please select a date within the next 60 days.',
      });
      return;
    }

    // 🕒 End time logic
    let end: Dayjs;
    if (slotType === 'demo') {
      end = start.add(15, 'minute');
    } else {
      if (!endTime) {
        toast({ title: 'Missing End Time', description: 'Select end time for regular slot.' });
        return;
      }
      end = selectedDate
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(0);

      if (end.isBefore(start) || end.isSame(start)) {
        toast({ title: 'Invalid Range', description: 'End time must be after start time.' });
        return;
      }

      // ⏰ Max duration: 2 hours
      if (end.diff(start, 'minutes') > 120) {
        toast({
          title: 'Too Long',
          description: 'Regular slots cannot exceed 2 hours.',
        });
        return;
      }
    }

    const newSlot = {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      slotType,
    };

    // 🔁 Local overlap check
    const overlap = slots.some(
      (s) =>
        dayjs(newSlot.startTime).isBefore(dayjs(s.endTime)) &&
        dayjs(newSlot.endTime).isAfter(dayjs(s.startTime))
    );
    if (overlap) {
      toast({ title: 'Overlap Detected', description: 'This slot overlaps with another slot.' });
      return;
    }

    // 🔁 Already exists on backend?
    const existsOnServer = mySlots.some(
      (s) =>
        dayjs(s.startTime).isSame(newSlot.startTime) && s.slotType === newSlot.slotType
    );
    if (existsOnServer) {
      toast({
        title: 'Already Exists',
        description: 'You have already created a slot at this time.',
      });
      return;
    }

    // 🔢 Limit local unsaved slots
    if (slots.length >= 10) {
      toast({
        title: 'Limit Reached',
        description: 'You can add up to 10 slots at a time. Please save first.',
      });
      return;
    }

    setSlots([...slots, newSlot]);
    toast({
      title: 'Slot Added',
      description: `${slotType === 'demo' ? 'Demo (15 min)' : 'Regular'} slot added.`,
    });
    setStartTime(null);
    setEndTime(null);
  };

  const handleRemoveSlot = (index: number) => {
    const updated = [...slots];
    updated.splice(index, 1);
    setSlots(updated);
  };

  const handleConfirm = async () => {
    if (slots.length === 0) {
      toast({ title: 'No Slots', description: 'Please add at least one slot before saving.' });
      return;
    }
    try {
      setLoading(true);
      const res = await setTutorSlots({ slots });
      toast({
        title: res?.success ? 'Slots Saved' : 'Update Failed',
        description: res?.message || 'Slots updated successfully.',
      });
      setSlots([]);
      fetchMySlots();
      // Reset pickers
      setSelectedDate(dayjs());
      setStartTime(null);
      setEndTime(null);
      setSlotType('demo');
    } catch (err: any) {
      toast({
        title: 'Failed to Save',
        description: err?.response?.data?.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      const res = await deleteSlot(slotId);
      toast({
        title: res?.success ? 'Deleted' : 'Failed',
        description: res?.message || 'Slot deleted successfully.',
      });
      fetchMySlots();
    } catch {
      toast({ title: 'Failed', description: 'Error deleting slot.' });
    }
  };

  const filteredSlots =
    filterType === 'all'
      ? mySlots
      : mySlots.filter((slot) => slot.slotType === filterType);

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
        <Topbar title="Set Your Availability" subtitle="Create, view, and manage your slots" />
        <main className="p-6 space-y-6">
          {/* CREATE NEW SLOTS */}
          <Card className="p-6 rounded-2xl shadow-soft bg-white space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Choose Date & Time
              </h2>

              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                {(['demo', 'regular'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSlotType(type)}
                    className={`px-4 py-2 text-sm font-medium ${
                      slotType === type
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'demo' ? 'Demo (15 min)' : 'Regular (custom)'}
                  </button>
                ))}
              </div>
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="flex flex-col items-center">
                  <StaticDatePicker
                    value={selectedDate}
                    onChange={(val) => setSelectedDate(val)}
                    displayStaticWrapperAs="desktop"
                    shouldDisableDate={(date) => date.isBefore(dayjs(), 'day')}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-primary" /> Choose Time
                  </h3>
                  <StaticTimePicker
                    orientation="landscape"
                    value={startTime}
                    onChange={(val) => setStartTime(val)}
                  />
                  {slotType === 'regular' && (
                    <>
                      <h4 className="mt-4 text-sm text-gray-600">Select End Time</h4>
                      <StaticTimePicker
                        orientation="landscape"
                        value={endTime}
                        onChange={(val) => setEndTime(val)}
                      />
                    </>
                  )}
                  <Button
                    onClick={handleAddSlot}
                    disabled={!selectedDate || !startTime}
                    className="mt-4 bg-primary text-white hover:bg-primary/90"
                  >
                    Add {slotType === 'demo' ? 'Demo' : 'Regular'} Slot
                  </Button>
                </div>
              </div>
            </LocalizationProvider>

            {/* Selected Slots (Not yet saved) */}
            <AnimatePresence>
              {slots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-semibold mb-3">Slots to be Saved</h3>
                  <ul className="space-y-2">
                    {slots.map((slot, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                      >
                        <div>
                          <span className="block font-medium text-gray-800">
                            {dayjs(slot.startTime).format('MMM D, YYYY h:mm A')} –{' '}
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
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveSlot(idx)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleConfirm}
                disabled={slots.length === 0 || loading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {loading ? 'Saving…' : `Save ${slots.length} Slot${slots.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </Card>

          {/* MY EXISTING SLOTS */}
          <Card className="p-6 bg-white rounded-2xl shadow-soft mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> My Slots
              </h3>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                {(['all', 'demo', 'regular'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-sm font-medium capitalize ${
                      filterType === type
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {fetching ? (
              <p className="text-gray-500 text-center py-4">Loading your slots...</p>
            ) : filteredSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No {filterType !== 'all' ? filterType : ''} slots available.
              </p>
            ) : (
              <ul className="space-y-3">
                {filteredSlots.map((slot) => (
                  <motion.li
                    key={slot._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {dayjs(slot.startTime).format('MMM D, YYYY h:mm A')} –{' '}
                        {dayjs(slot.endTime).format('h:mm A')}
                      </div>
                      <div
                        className={`text-xs font-semibold uppercase ${
                          slot.slotType === 'demo' ? 'text-green-600' : 'text-blue-600'
                        }`}
                      >
                        {slot.slotType === 'demo' ? 'Demo Slot' : 'Regular Slot'}
                      </div>
                      {slot.isBooked && (
                        <div className="text-xs text-red-500 mt-1">Already booked</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(slot._id!)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
