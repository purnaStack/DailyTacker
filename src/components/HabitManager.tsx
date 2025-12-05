import { useState } from 'react';
import { X, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Habit } from './Dashboard';

interface HabitManagerProps {
  habits: Habit[];
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
];

export function HabitManager({ habits, onClose }: HabitManagerProps) {
  const { user } = useAuth();
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState(PRESET_COLORS[0]);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  const addHabit = async () => {
    if (!user || !newHabitName.trim() || habits.length >= 25) return;

    setLoading(true);
    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: newHabitName.trim(),
      color: newHabitColor,
      order_index: habits.length,
    });

    if (!error) {
      setNewHabitName('');
      setNewHabitColor(PRESET_COLORS[0]);
      onClose();
    }
    setLoading(false);
  };

  const updateHabit = async (habitId: string, name: string) => {
    if (!name.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('habits')
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq('id', habitId);

    if (!error) {
      setEditingHabit(null);
      onClose();
    }
    setLoading(false);
  };

  const deleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit? All completion data will be lost.')) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('habits').delete().eq('id', habitId);

    if (!error) {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Manage Habits</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Add New Habit ({habits.length}/25)
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                placeholder="e.g., Morning Exercise, Read 30 min"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || habits.length >= 25}
                maxLength={50}
              />
              <select
                value={newHabitColor}
                onChange={(e) => setNewHabitColor(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {PRESET_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              <button
                onClick={addHabit}
                disabled={loading || !newHabitName.trim() || habits.length >= 25}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {habits.length >= 25 && (
              <p className="text-sm text-orange-600 mt-2">
                Maximum of 25 habits reached
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Your Habits
            </h3>
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  {editingHabit === habit.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateHabit(habit.id, editName);
                        if (e.key === 'Escape') setEditingHabit(null);
                      }}
                      onBlur={() => setEditingHabit(null)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                      maxLength={50}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingHabit(habit.id);
                        setEditName(habit.name);
                      }}
                      className="flex-1 text-left text-gray-900 hover:text-blue-600"
                    >
                      {habit.name}
                    </button>
                  )}
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No habits yet. Add your first one above!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
