import * as React from "react";

interface BadgeProps {
  text: string;
  variant: 'Light' | 'Dark';
}

export const Badge = ({ text, variant }: BadgeProps) => (
  <span
    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
      variant === 'Light'
        ? 'bg-gray-100 text-gray-800'
        : 'bg-gray-800 text-white'
    }`}
  >
    {text}
  </span>
);
