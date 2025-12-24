import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rect",
  width,
  height,
}) => {
  const baseClasses = "animate-pulse bg-gray-200";
  const variantClasses = {
    text: "h-4 w-3/4 rounded mb-2",
    rect: "rounded-xl",
    circle: "rounded-full",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const PathCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col items-start gap-4">
    <Skeleton variant="circle" width={48} height={48} />
    <Skeleton variant="text" width="60%" />
    <div className="space-y-2 w-full">
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="80%" />
    </div>
    <div className="mt-auto pt-4 w-full flex justify-between">
      <Skeleton variant="rect" width={80} height={20} />
      <Skeleton variant="rect" width={60} height={20} />
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-6 shadow-md flex justify-between items-center"
      >
        <div className="space-y-2 w-1/2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="80%" />
        </div>
        <Skeleton variant="circle" width={48} height={48} />
      </div>
    ))}
  </div>
);

export const CategorySkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton
        key={i}
        variant="rect"
        height={48}
        className="w-full rounded-xl"
      />
    ))}
  </div>
);
