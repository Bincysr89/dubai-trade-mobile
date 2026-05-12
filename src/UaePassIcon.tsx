/**
 * UAE PASS official fingerprint mark.
 * A stylized thumbprint whose ridges are tinted in the UAE flag colors:
 * red, green, white, and black. Sized via `size` prop (default 24px).
 */
export default function UaePassIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="UAE Pass"
      style={{ flexShrink: 0 }}
    >
      {/* outer thumbprint silhouette */}
      <path
        d="M16 3c-4.4 0-8 3.4-8 7.7v3.6c0 5.5 1 9.4 2.7 13.3"
        stroke="#0E1B3D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 14.3v-3.6C24 6.4 20.4 3 16 3"
        stroke="#0E1B3D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* red ridge (top) */}
      <path
        d="M11 9c1.4-1.2 3-2 5-2s3.6.8 5 2"
        stroke="#EF3340"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* green ridge */}
      <path
        d="M9.5 13.5c1.5-1.9 4-3 6.5-3s5 1.1 6.5 3"
        stroke="#00843D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* white ridge (rendered as light gray for visibility on white bg) */}
      <path
        d="M9 18c1.7-1.6 4.2-2.5 7-2.5s5.3.9 7 2.5"
        stroke="#E5E7EB"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* black ridge (bottom) */}
      <path
        d="M10 23c1.7-1.4 3.8-2 6-2s4.3.6 6 2"
        stroke="#0E1B3D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* bottom flick */}
      <path
        d="M13 28c.6.2 1.2.3 2 .3"
        stroke="#0E1B3D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
