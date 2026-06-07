interface BadmintonCourtPatternProps {
  className?: string;
}

export default function BadmintonCourtPattern({ className = '' }: BadmintonCourtPatternProps) {
  return (
    <svg className = {className} width = "100%" height = "100%" xmlns = "http://www.w3.org/2000/svg" preserveAspectRatio = "none"
    >
      <defs>
        <pattern id = "court-pattern" x = "0" y = "0" width = "100" height = "100" patternUnits = "userSpaceOnUse"
        >
          {/* Court lines */}
          <line x1 = "0" y1 = "50" x2 = "100" y2 = "50" stroke = "currentColor" strokeWidth = "0.5" opacity = "0.1" />
          <line x1 = "50" y1 = "0" x2 = "50" y2 = "100" stroke = "currentColor" strokeWidth = "0.5" opacity = "0.1" />
          <rect x = "20" y = "20" width = "60" height = "60" fill = "none" stroke = "currentColor" strokeWidth = "0.5" opacity = "0.05" />
        </pattern>
      </defs>
      <rect width = "100%" height = "100%" fill = "url(#court-pattern)" />
    </svg>
  );
}
