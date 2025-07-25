const ArrowLeftIcon = (props: { class?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width={2}
      stroke="currentColor"
      class={props.class ?? "w-4 h-4"}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
      />
    </svg>
  );
  export default ArrowLeftIcon;
  