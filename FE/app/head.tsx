export default function Head() {
  return (
    <>
      <meta name="darkreader-lock" content="true" />
      <meta name="darkreader" content="disable" />
      <style data-darkreader-style="active" media="not screen">
        {`
        :root {
          --darkreader-neutral-background: white !important;
          --darkreader-neutral-text: black !important;
          --darkreader-selection-background: #8ab4f8 !important;
          --darkreader-selection-text: #000 !important;
        }
        `}
      </style>
    </>
  );
} 