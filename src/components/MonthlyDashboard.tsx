import { ChevronLeft, ChevronRight, TrendingUp, Calendar, Award } from 'lucide-react';
import { Habit, HabitCompletion } from './Dashboard';

interface MonthlyDashboardProps {
  habits: Habit[];
  completions: HabitCompletion[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthlyDashboard({
  habits,
  completions,
  currentMonth,
  onMonthChange,
}: MonthlyDashboardProps) {
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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

  const getDailyCompletions = () => {
    const daily: { [key: number]: number } = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateStr = date.toISOString().split('T')[0];
      daily[day] = completions.filter((c) => c.completed_date === dateStr).length;
    }
    return daily;
  };

  const getWeeklyStats = () => {
    const weeks: { week: number; completions: number; percentage: number }[] = [];
    const dailyCompletions = getDailyCompletions();

    for (let week = 0; week < 5; week++) {
      const startDay = week * 7 + 1;
      const endDay = Math.min(startDay + 6, daysInMonth);
      let weekCompletions = 0;

      for (let day = startDay; day <= endDay; day++) {
        weekCompletions += dailyCompletions[day] || 0;
      }

      const daysInWeek = endDay - startDay + 1;
      const maxPossible = habits.length * daysInWeek;
      const percentage = maxPossible > 0 ? Math.round((weekCompletions / maxPossible) * 100) : 0;

      if (startDay <= daysInMonth) {
        weeks.push({
          week: week + 1,
          completions: weekCompletions,
          percentage,
        });
      }
    }

    return weeks;
  };

  const getTopHabits = () => {
    const habitStats = habits.map((habit) => {
      const completed = completions.filter((c) => c.habit_id === habit.id).length;
      const percentage = daysInMonth > 0 ? Math.round((completed / daysInMonth) * 100) : 0;
      return { habit, completed, percentage };
    });

    return habitStats.sort((a, b) => b.percentage - a.percentage).slice(0, 10);
  };

  const dailyCompletions = getDailyCompletions();
  const weeklyStats = getWeeklyStats();
  const topHabits = getTopHabits();

  const totalCompletions = completions.length;
  const maxPossible = habits.length * daysInMonth;
  const overallPercentage = maxPossible > 0 ? Math.round((totalCompletions / maxPossible) * 100) : 0;

  const maxDailyCompletions = Math.max(...Object.values(dailyCompletions), 1);

  const getBestStreak = () => {
    let currentStreak = 0;
    let bestStreak = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const count = dailyCompletions[day] || 0;
      if (count > 0) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return bestStreak;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-blue-700 font-medium">Overall Progress</div>
            </div>
            <div className="text-3xl font-bold text-blue-900">{overallPercentage}%</div>
            <div className="text-sm text-blue-600 mt-1">
              {totalCompletions} / {maxPossible} completed
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-green-700 font-medium">Best Streak</div>
            </div>
            <div className="text-3xl font-bold text-green-900">{getBestStreak()}</div>
            <div className="text-sm text-green-600 mt-1">consecutive days</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-sm text-orange-700 font-medium">Active Habits</div>
            </div>
            <div className="text-3xl font-bold text-orange-900">{habits.length}</div>
            <div className="text-sm text-orange-600 mt-1">being tracked</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-slate-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-sm text-slate-700 font-medium">Days Remaining</div>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {daysInMonth - new Date().getDate() + (currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() ? 0 : daysInMonth)}
            </div>
            <div className="text-sm text-slate-600 mt-1">in this month</div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Consistency</h3>
          <div className="flex items-end justify-between gap-1 h-48">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const count = dailyCompletions[day] || 0;
              const height = maxDailyCompletions > 0 ? (count / maxDailyCompletions) * 100 : 0;
              const isToday =
                currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear() &&
                day === new Date().getDate();

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: '12rem' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t transition-all ${
                        isToday
                          ? 'bg-blue-500'
                          : count > 0
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`Day ${day}: ${count} habits completed`}
                    />
                  </div>
                  <div
                    className={`text-xs ${
                      isToday ? 'font-bold text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
            <div className="space-y-3">
              {weeklyStats.map((week) => (
                <div key={week.week} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700 w-16">
                    Week {week.week}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full flex items-center justify-end px-2 transition-all"
                      style={{ width: `${week.percentage}%` }}
                    >
                      {week.percentage > 15 && (
                        <span className="text-xs font-semibold text-white">
                          {week.percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-20 text-right">
                    {week.completions} done
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Habits</h3>
            <div className="space-y-3">
              {topHabits.map((item, index) => (
                <div key={item.habit.id} className="flex items-center gap-3">
                  <div className="text-sm font-bold text-gray-500 w-6">
                    #{index + 1}
                  </div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.habit.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.habit.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.completed}/{daysInMonth}
                    </div>
                  </div>
                </div>
              ))}
              {topHabits.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No habits to display yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
