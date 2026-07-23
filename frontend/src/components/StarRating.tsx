import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  showText?: boolean;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  count,
  showText = true,
  size = 15,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-amber-500">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                size={size}
                className="fill-amber-400 text-amber-400"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <Star size={size} className="text-amber-300" />
                <div
                  className="absolute top-0 left-0 overflow-hidden text-amber-400"
                  style={{ width: '50%' }}
                >
                  <Star size={size} className="fill-amber-400 text-amber-400" />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                size={size}
                className="text-amber-200 fill-amber-50/50"
              />
            );
          }
        })}
      </div>
      {showText && (
        <span className="text-xs font-semibold text-warmbrown-800/80">
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="text-warmbrown-600/70 font-normal ml-1">
              ({count})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
