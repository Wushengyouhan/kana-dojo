'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import { ChevronUp } from 'lucide-react';
import { useSidebarStickyLayout } from '@/shared/hooks/useSidebarLayout';

interface CollapsibleSectionProps {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  level?: 'section' | 'subsection' | 'subsubsection';
  className?: string;
  /** Unique ID for session storage persistence */
  storageKey?: string;
  /** When true, applies a full border to the header and stretches it from the sidebar to the viewport right edge */
  fullBorder?: boolean;
}

const levelStyles = {
  section: {
    header: 'text-3xl py-4',
    border: 'border-b-2 border-(--border-color)',
    chevronSize: 24,
    gap: 'gap-4',
  },
  subsection: {
    header: 'text-2xl py-3',
    border: 'border-b-1 border-(--border-color)',
    chevronSize: 22,
    gap: 'gap-3',
  },
  subsubsection: {
    header: 'text-xl py-2',
    border: '',
    chevronSize: 20,
    gap: 'gap-2',
  },
};

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  level = 'section',
  className,
  storageKey,
  fullBorder = false,
}: CollapsibleSectionProps) => {
  const { playClick } = useClick();

  // Initialize state from session storage or default
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const stored = sessionStorage.getItem(`collapsible-${storageKey}`);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return defaultOpen;
  });

  // Persist state to session storage
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      sessionStorage.setItem(`collapsible-${storageKey}`, String(isOpen));
    }
  }, [isOpen, storageKey]);

  const styles = levelStyles[level];

  const handleToggle = () => {
    playClick();
    setIsOpen(prev => !prev);
  };

  // Ref for measuring the button's natural position (used only when fullBorder)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const stickyLayout = useSidebarStickyLayout(
    fullBorder
      ? (buttonRef as React.RefObject<HTMLElement | null>)
      : { current: null },
  );

  // Inline styles for the full-bleed sticky header
  const fullBleedStyle: React.CSSProperties = fullBorder
    ? {
        marginLeft: `${stickyLayout.marginLeft}px`,
        width: stickyLayout.width > 0 ? `${stickyLayout.width}px` : '100vw',
      }
    : {};

  return (
    <div className={clsx('flex flex-col', styles.gap, className)}>
      <button
        ref={fullBorder ? buttonRef : undefined}
        className={clsx(
          'group flex w-full flex-row items-center gap-2 text-left',
          'hover:cursor-pointer',
          styles.header,
          fullBorder
            ? clsx(
                'border-b-2 border-(--border-color) bg-(--background-color) px-4 py-3',
                'sticky top-0 z-30',
              )
            : styles.border,
        )}
        style={fullBleedStyle}
        onClick={handleToggle}
      >
        {/* Chevron icon with rotation animation */}
        <ChevronUp
          className={clsx(
            'transition-transform duration-300 ease-out',
            'transition-colors delay-200 duration-300',
            'text-(--main-color)',
            'max-md:group-active:text-(--main-color)',
            'md:group-hover:text-(--main-color)',
            !isOpen && 'rotate-180',
          )}
          size={styles.chevronSize}
        />

        {/* Optional icon */}
        {icon && (
          <span className='flex items-center text-(--secondary-color)'>
            {icon}
          </span>
        )}

        {/* Title */}
        <span>{title}</span>
      </button>

      {/* Content with smooth height animation using CSS grid trick */}
      <div
        className={clsx(
          'grid overflow-hidden',
          'transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className='min-h-0'>{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
