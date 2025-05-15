export default function ArrowRightIcon({ class: className = "w-5 h-5" }: { class?: string }) {
    return (
        <svg
            class={className}
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
        </svg>
    );
} 