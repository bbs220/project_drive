import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useUIStore } from "../stores/useUIStore";
import { useAllVehicleInput } from "../hooks/useAllVehicleInput";
import { sceneConstants } from "../constants/otherConstants";

const MiniMap = () => {
  const showMap = useUIStore((state) => state.showMap);
  const controlsRef = useAllVehicleInput();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const isExpandedRef = useRef(false);
  const prevMapKeyRef = useRef(false);

  // setup the GSAP timeline
  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      tl.current = gsap.timeline({ paused: true }).to(wrapperRef.current, {
        width: "85vw",
        height: "80vh",
        right: "50%",
        top: "45%",
        xPercent: 50, // centers it horizontally against right: 50%
        yPercent: -50, // centers it vertically against top: 45%
        borderRadius: "16px",
        pointerEvents: "auto",
        duration: 0.35,
        ease: "power3.inOut",
      });

      // ensure state resets if unmounted/hidden
      isExpandedRef.current = false;
    },
    { scope: wrapperRef, dependencies: [showMap] },
  );

  // minimal polling loop JUST for the map key toggle
  useEffect(() => {
    if (!showMap) return;

    let animationFrameId: number;

    const checkInput = () => {
      animationFrameId = requestAnimationFrame(checkInput);

      const currentMapKey = controlsRef.current.map;

      if (currentMapKey && !prevMapKeyRef.current) {
        isExpandedRef.current = !isExpandedRef.current;

        if (isExpandedRef.current) {
          tl.current?.play();
        } else {
          tl.current?.reverse();
        }
      }
      prevMapKeyRef.current = currentMapKey;
    };

    animationFrameId = requestAnimationFrame(checkInput);
    return () => cancelAnimationFrame(animationFrameId);
  }, [showMap, controlsRef]);

  return (
    <div
      ref={wrapperRef}
      className={`${
        showMap ? "block" : "hidden"
      } fixed ${sceneConstants.isDev ? "right-90" : "right-2"}right-90 top-2 size-60 border-2 border-white z-14 rounded-xl pointer-events-none bg-black/40`}
    ></div>
  );
};

export default MiniMap;
