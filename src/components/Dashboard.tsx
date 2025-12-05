import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Plus } from 'lucide-react';
import { HabitManager } from './HabitManager';
import { HabitGrid } from './HabitGrid';
import { MonthlyDashboard } from './MonthlyDashboard';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'dashboard'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadHabits();
    loadCompletions();
  }, [user, currentMonth]);

  const loadHabits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error loading habits:', error);
    } else {
      setHabits(data || []);
    }
    setLoading(false);
  };

  const loadCompletions = async () => {
    if (!user) return;

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startOfMonth.toISOString().split('T')[0])
      .lte('completed_date', endOfMonth.toISOString().split('T')[0]);

    if (error) {
      console.error('Error loading completions:', error);
    } else {
      setCompletions(data || []);
    }
  };

  const toggleCompletion = async (habitId: string, date: Date) => {
    if (!user) return;

    const dateStr = date.toISOString().split('T')[0];
    const existing = completions.find(
      (c) => c.habit_id === habitId && c.completed_date === dateStr
    );

    if (existing) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);

      if (!error) {
        setCompletions(completions.filter((c) => c.id !== existing.id));
      }
    } else {
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: dateStr,
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        setCompletions([...completions, data]);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TaskTraQ</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="flex gap-3">
              {habits.length < 25 && (
                <button
                  onClick={() => setShowHabitManager(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Habit
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setCurrentView('grid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Daily Grid
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to TaskTraQ!
            </h2>
            <p className="text-gray-600 mb-6">
              Start by adding your first habit to track.
            </p>
            <button
              onClick={() => setShowHabitManager(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Habit
            </button>
          </div>
        ) : currentView === 'grid' ? (
          <HabitGrid
            habits={habits}
            completions={completions}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onToggleCompletion={toggleCompletion}
            onEditHabits={() => setShowHabitManager(true)}
          />
        ) : (
          <MonthlyDashboard
            habits={habits}
            completions={completions}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        )}
      </div>

      {showHabitManager && (
        <HabitManager
          habits={habits}
          onClose={() => {
            setShowHabitManager(false);
            loadHabits();
          }}
        />
      )}
    </div>
  );
}
