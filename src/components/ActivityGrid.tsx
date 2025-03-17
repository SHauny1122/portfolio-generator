import React from 'react';

interface ActivityGridProps {
  commitActivity: {
    total: number;
    week: string;
    days: number[];
  }[];
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({ commitActivity }) => {
  // Process commit data into a grid format
  const getGridData = () => {
    const days = commitActivity[0]?.days || [];
    return days.map(count => ({
      count,
      intensity: Math.min(count / 10, 1) // normalize intensity
    }));
  };

  // Get color based on activity intensity using brighter colors
  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-800/30 backdrop-blur-sm';
    
    const colors = {
      low: 'from-emerald-300 to-teal-200',
      medium: 'from-violet-300 to-fuchsia-200',
      high: 'from-rose-300 to-pink-200'
    };
    
    const gradientColor = intensity < 0.3 ? colors.low : 
                         intensity < 0.7 ? colors.medium : 
                         colors.high;
    
    return `bg-gradient-to-br ${gradientColor} opacity-${Math.max(40, Math.round(intensity * 100))} backdrop-blur-sm`;
  };

  const gridData = getGridData();

  return (
    <div className="glass-card p-3 rounded-lg backdrop-blur-sm h-full flex flex-col justify-center">
      <h3 className="text-sm font-semibold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
        Activity
      </h3>
      <div className="grid grid-cols-[repeat(13,1fr)] gap-0.5 w-full">
        {gridData.map((day, index) => (
          <div
            key={index}
            className={`aspect-square w-3 rounded-sm ${getColor(day.intensity)} transition-all duration-200 hover:scale-150 hover:z-10 border border-gray-700/30`}
            title={`${day.count} commits`}
          />
        ))}
      </div>
      <div className="mt-2 text-[10px] text-gray-400 flex justify-between items-center">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-2 h-2 rounded-sm bg-gray-800/30 backdrop-blur-sm border border-gray-700/30" />
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-emerald-300 to-teal-200 opacity-40 backdrop-blur-sm border border-gray-700/30" />
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-violet-300 to-fuchsia-200 opacity-60 backdrop-blur-sm border border-gray-700/30" />
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-rose-300 to-pink-200 opacity-80 backdrop-blur-sm border border-gray-700/30" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
