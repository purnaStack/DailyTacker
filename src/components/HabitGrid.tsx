import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Habit, HabitCompletion } from './Dashboard';

interface HabitGridProps {
  habits: Habit[];
  completions: HabitCompletion[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onToggleCompletion: (habitId: string, date: Date) => void;
  onEditHabits: () => void;
}

export function HabitGrid({
  habits,
  completions,
  currentMonth,
  onMonthChange,
  onToggleCompletion,
  onEditHabits,
}: HabitGridProps) {
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isCompleted = (habitId: string, day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const dateStr = date.toISOString().split('T')[0];
    return completions.some(
      (c) => c.habit_id === habitId && c.completed_date === dateStr
    );
  };

  const getHabitStats = (habitId: string) => {
    const completed = completions.filter((c) => c.habit_id === habitId).length;
    const percentage = daysInMonth > 0 ? Math.round((completed / daysInMonth) * 100) : 0;
    return { completed, percentage };
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const today = new Date();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={onEditHabits}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Manage Habits
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                Habit
              </th>
              <th className="px-2 py-3 text-center text-sm font-semibold text-gray-700 min-w-[60px]">
                Progress
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                const isToday =
                  isCurrentMonth && day === today.getDate();
                return (
                  <th
                    key={day}
                    className={`px-2 py-3 text-center text-sm font-medium min-w-[40px] ${
                      isToday
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {habits.map((habit) => {
              const stats = getHabitStats(habit.id);
              return (
                <tr key={habit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {habit.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">
                        {stats.percentage}%
                      </div>
                      <div className="text-gray-500">
                        {stats.completed}/{daysInMonth}
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const date = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day
                      );
                      const completed = isCompleted(habit.id, day);
                      const isToday =
                        isCurrentMonth && day === today.getDate();
                      const isFuture = date > today;

                      return (
                        <td
                          key={day}
                          className={`px-2 py-3 text-center ${
                            isToday ? 'bg-blue-50' : ''
                          }`}
                        >
                          <button
                            onClick={() => onToggleCompletion(habit.id, date)}
                            disabled={isFuture}
                            className={`w-8 h-8 rounded-md transition-all ${
                              completed
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-200 hover:bg-gray-300'
                            } ${
                              isFuture
                                ? 'opacity-30 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                            title={
                              completed
                                ? 'Mark as incomplete'
                                : 'Mark as complete'
                            }
                          >
                            {completed && (
                              <span className="text-white text-lg">✓</span>
                            )}
                          </button>
                        </td>
                      );
                    }
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Habits</div>
            <div className="text-2xl font-bold text-gray-900">{habits.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Completions</div>
            <div className="text-2xl font-bold text-gray-900">
              {completions.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Avg Completion Rate</div>
            <div className="text-2xl font-bold text-gray-900">
              {habits.length > 0
                ? Math.round(
                    (completions.length / (habits.length * daysInMonth)) * 100
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
