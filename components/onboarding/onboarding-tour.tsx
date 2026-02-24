"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Joyride, {
  ACTIONS,
  EVENTS,
  STATUS,
  type Actions,
  type CallBackProps,
  type Step,
} from "react-joyride";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

const ONBOARDING_STATUS_KEY_PREFIX = "crewbooks_onboarding_v1_status";

type TourStep = Step & {
  route?: string;
};

export function OnboardingTour() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
  const [onboardingStatusKey, setOnboardingStatusKey] = useState<string | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const targetRetryCountsRef = useRef<Record<number, number>>({});
  const isDark = resolvedTheme === "dark";

  const steps = useMemo<TourStep[]>(
    () => [
      {
        target: "body",
        placement: "center",
        disableBeacon: true,
        content:
          "Welcome to CrewBooks. This quick tour will show you the main workflow to get started.",
      },
      {
        target: "[data-tour='tax-year']",
        route: "/dashboard",
        content: "Pick a tax year here. Most screens update to the selected year automatically.",
      },
      {
        target: "[data-tour='sidebar-income']",
        route: "/dashboard",
        content: "Start here to track earnings, contracts, and payment records.",
      },
      {
        target: "[data-tour='add-income']",
        route: "/income",
        content: "Use this button to add your first income record.",
      },
      {
        target: "[data-tour='sidebar-expenses']",
        route: "/income",
        content: "This is where you manage and review your expenses.",
      },
      {
        target: "[data-tour='add-expense']",
        route: "/expenses",
        content: "Use this button to add your first expense record.",
      },
      {
        target: "[data-tour='sidebar-settings']",
        route: "/expenses",
        content: "Open Settings any time to customize categories and tracking behavior.",
      },
      {
        target: "[data-tour='settings-title']",
        route: "/settings",
        content: "Settings controls your categories and tracking behavior. Save Settings at the bottom when you are done.",
      },
    ],
    []
  );

  const joyrideStyles = useMemo(() => {
    const tooltipBackground = isDark ? "hsl(300 100% 99%)" : "hsl(222.2 84% 4.9%)";
    const tooltipText = isDark ? "hsl(239 89% 24%)" : "hsl(210 40% 98%)";
    const tooltipMuted = isDark ? "hsl(239 50% 35%)" : "hsl(215 20.2% 75%)";
    const tooltipBorder = isDark ? "hsl(239 30% 88%)" : "hsl(217.2 32.6% 24%)";
    const buttonBackground = "hsl(35 67% 52%)";
    const buttonText = "hsl(239 89% 24%)";

    return {
      options: {
        zIndex: 10000,
        backgroundColor: tooltipBackground,
        primaryColor: buttonBackground,
        textColor: tooltipText,
        arrowColor: tooltipBackground,
        overlayColor: "rgba(0, 0, 0, 0.6)",
        spotlightShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
      },
      tooltip: {
        border: `2px solid ${tooltipBorder}`,
        borderRadius: "var(--radius)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
      },
      tooltipContent: {
        color: tooltipText,
      },
      buttonNext: {
        backgroundColor: buttonBackground,
        color: buttonText,
        borderRadius: "0.45rem",
      },
      buttonBack: {
        color: tooltipText,
      },
      buttonSkip: {
        color: tooltipMuted,
      },
    };
  }, [isDark]);

  useEffect(() => {
    setMounted(true);
    const bootstrap = async () => {
      try {
        const response = await fetch("/api/auth/user", { cache: "no-store" });
        if (!response.ok) {
          setIsBootstrapLoading(false);
          return;
        }

        const user = await response.json();
        const userId = typeof user?.id === "string" ? user.id : null;
        if (!userId) {
          setIsBootstrapLoading(false);
          return;
        }

        const key = `${ONBOARDING_STATUS_KEY_PREFIX}:${userId}`;
        setOnboardingStatusKey(key);

        const status = window.localStorage.getItem(key);
        if (!status) {
          setTourOpen(true);
          setRun(true);
          setStepIndex(0);
        }
      } catch {
        // If bootstrap fails, do not block page usage.
      } finally {
        setIsBootstrapLoading(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!mounted || !tourOpen) {
      return;
    }

    const step = steps[stepIndex];
    if (!step) {
      return;
    }

    if (step.route && pathname !== step.route) {
      if (run) {
        setRun(false);
      }
      router.push(step.route);
      return;
    }

    if (!run) {
      setRun(true);
    }
  }, [mounted, pathname, router, run, stepIndex, steps]);

  const finishTour = (status: "completed" | "skipped") => {
    setRun(false);
    setTourOpen(false);
    setStepIndex(0);
    targetRetryCountsRef.current = {};
    if (onboardingStatusKey) {
      window.localStorage.setItem(onboardingStatusKey, status);
    }
    // Defensive cleanup in case the library leaves scroll/overflow styles behind.
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.querySelectorAll("main").forEach((element) => {
      const main = element as HTMLElement;
      main.style.overflow = "";
      main.style.overflowX = "";
      main.style.overflowY = "";
    });
  };

  const handleCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (status === STATUS.FINISHED) {
      finishTour("completed");
      return;
    }

    if (status === STATUS.SKIPPED) {
      finishTour("skipped");
      return;
    }

    if (action === (ACTIONS.CLOSE as Actions)) {
      finishTour("skipped");
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      targetRetryCountsRef.current = {};
      const delta = action === ACTIONS.PREV ? -1 : 1;
      const nextIndex = index + delta;
      if (nextIndex >= steps.length) {
        finishTour("completed");
        return;
      }
      if (nextIndex < 0) {
        setStepIndex(0);
        return;
      }

      if (nextIndex >= 0 && nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        if (nextStep?.route && pathname !== nextStep.route) {
          setRun(false);
          setStepIndex(nextIndex);
          router.push(nextStep.route);
          return;
        }
        setStepIndex(nextIndex);
      }
      return;
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      const currentStep = steps[index];
      if (currentStep?.route && pathname !== currentStep.route) {
        setRun(false);
        router.push(currentStep.route);
        return;
      }

      const retries = targetRetryCountsRef.current[index] ?? 0;
      if (retries < 8) {
        targetRetryCountsRef.current[index] = retries + 1;
        setRun(false);
        window.setTimeout(() => {
          setRun(true);
        }, 150);
        return;
      }

      targetRetryCountsRef.current[index] = 0;
      if (index < steps.length - 1) {
        setStepIndex(index + 1);
      }
    }
  };

  if (!mounted || isBootstrapLoading) {
    return null;
  }

  if (!tourOpen) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleCallback}
      disableScrollParentFix
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      spotlightClicks
      scrollToFirstStep
      styles={joyrideStyles}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip",
      }}
    />
  );
}
