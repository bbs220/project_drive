import { Fragment } from "react";
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
} from "../../stores/useVehicleStore";
import { respawnValues } from "../../constants/otherConstants";
import { useUIStore } from "../../stores/useUIStore";

// define strict type for our generic control items
type typeControlItem = {
  keys: string;
  action: string;
};

// generic highly reusable component for bottom screen controls
const SharedControlsDisplay = ({
  controls,
}: {
  controls: typeControlItem[];
}) => {
  // subscribe to the controls and radar toggles in the ui store
  const showControls = useUIStore((state) => state.showControls);
  const showRadar = useUIStore((state) => state.showRadar);

  // if disabled in settings, return nothing to completely hide the ui element
  if (!showControls) return null;

  // isolate universal controls to stack them on a secondary row
  const universalControls = [
    { keys: "F", action: "mount/unmount" },
    { keys: "R", action: "respawn" },
  ];

  // only show the map keybind if the radar is actually enabled in the HUD
  if (showRadar) {
    universalControls.push({ keys: "M", action: "map" });
  }

  return (
    // container automatically flexes to the narrower content width with flex col
    <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 whitespace-nowrap rounded-md border border-tron-cyan px-8 py-2 z-10 font-label text-xs [box-shadow:0_0_15px_rgba(0,243,255,0.2)] backdrop-blur-md">
      {/* primary row specific vehicle and character controls */}
      <div className="flex items-center gap-4">
        {controls.map((ctrl, index) => (
          <Fragment key={ctrl.keys}>
            <span className="flex items-center gap-2">
              <strong className="font-telemetry text-sm text-tron-yellow [text-shadow:0_0_8px_var(--color-tron-yellow)]">
                {ctrl.keys}
              </strong>
              <span className="tracking-wider text-gray-200 uppercase">
                {ctrl.action}
              </span>
            </span>
            {/* render the divider dot on everything except the final item */}
            {index < controls.length - 1 && (
              <span className="h-1 w-1 rounded-full bg-tron-cyan/50"></span>
            )}
          </Fragment>
        ))}
      </div>

      {/* secondary row universal system controls slightly dimmed for visual hierarchy */}
      <div className="flex items-center gap-4 opacity-75">
        {universalControls.map((ctrl, index) => (
          <Fragment key={ctrl.keys}>
            <span className="flex items-center gap-2">
              <strong className="font-telemetry text-sm text-tron-yellow [text-shadow:0_0_8px_var(--color-tron-yellow)]">
                {ctrl.keys}
              </strong>
              <span className="tracking-wider text-gray-200 uppercase">
                {ctrl.action}
              </span>
            </span>
            {/* render the divider dot on everything except the final item */}
            {index < universalControls.length - 1 && (
              <span className="h-1 w-1 rounded-full bg-tron-cyan/50"></span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

// interactive attitude indicator for pitch and roll visualization
const AttitudeIndicator = ({
  pitch,
  roll,
  yaw,
}: {
  pitch: number;
  roll: number;
  yaw: number;
}) => {
  // clamp pitch visual translation to prevent the horizon from leaving the circular bounds
  const pitchOffset = Math.max(Math.min(pitch * 40, 40), -40);

  return (
    // attitude container with glowing border only and no outer shadow
    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-tron-cyan p-2 [box-shadow:0_0_15px_rgba(0,243,255,0.2)] backdrop-blur-md">
      {/* rotating compass bezel mapping to yaw with bright yellow text */}
      <div
        className="absolute inset-1 rounded-full font-label text-xs font-bold text-tron-yellow [text-shadow:0_0_8px_var(--color-tron-yellow)]"
        style={{ transform: `rotate(${-yaw}rad)` }}
      >
        {/* counter rotate spans so text stays upright */}
        <span
          className="absolute left-1/2 top-0"
          style={{ transform: `translateX(-50%) rotate(${yaw}rad)` }}
        >
          N
        </span>
        <span
          className="absolute right-0 top-1/2"
          style={{ transform: `translateY(-50%) rotate(${yaw}rad)` }}
        >
          E
        </span>
        <span
          className="absolute bottom-0 left-1/2"
          style={{ transform: `translateX(-50%) rotate(${yaw}rad)` }}
        >
          S
        </span>
        <span
          className="absolute left-0 top-1/2"
          style={{ transform: `translateY(-50%) rotate(${yaw}rad)` }}
        >
          W
        </span>
        <span
          className="absolute right-2 top-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          NE
        </span>
        <span
          className="absolute bottom-2 right-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          SE
        </span>
        <span
          className="absolute bottom-2 left-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          SW
        </span>
        <span
          className="absolute left-2 top-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          NW
        </span>
      </div>

      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-tron-cyan/50 shadow-inner">
        {/* rotating and translating container mapping to roll and pitch */}
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `rotate(${roll}rad) translateY(${pitchOffset}px)`,
          }}
        >
          {/* oversized transparent sky section anchored to center */}
          <div className="absolute -left-full bottom-1/2 h-[400%] w-[400%] bg-transparent" />
          {/* oversized tinted ground section anchored to center with thicker horizon line */}
          <div className="absolute -left-full top-1/2 h-[400%] w-[400%] border-t-[3px] border-tron-cyan bg-tron-cyan/10" />
        </div>

        {/* fixed reticle overlay isolated with bright yellow */}
        <div className="absolute flex items-center justify-center gap-4">
          <div className="h-0.5 w-4 bg-tron-yellow shadow-neon-yellow" />
          <div className="h-1 w-1 rounded-full bg-tron-yellow shadow-neon-yellow" />
          <div className="h-0.5 w-4 bg-tron-yellow shadow-neon-yellow" />
        </div>
      </div>
    </div>
  );
};

// smooth scrolling altimeter tape component
const AltimeterTape = ({ altitude }: { altitude: number }) => {
  // calculate base altitude for single unit increments
  const baseAlt = Math.floor(altitude);

  // extract remainder to dynamically shift the tape smoothly between single units
  const remainder = altitude % 1;

  // calculate pixel offset treating each single step as twenty four pixels high
  const offsetPx = -remainder * 24;

  // format altitude to prevent padding issues on negative numbers
  const formatAltitude = (val: number) => {
    const isNegative = val < 0;
    // pad negative values to maintain consistent character width
    const paddingLength = isNegative ? 2 : 3;
    const absoluteString = Math.abs(val)
      .toString()
      .padStart(paddingLength, "0");
    return isNegative ? `-${absoluteString}` : absoluteString;
  };

  return (
    // altimeter container with glowing border only and no outer shadow
    <div className="relative flex h-24 w-20 items-center overflow-hidden rounded-md border border-tron-cyan pl-2 pr-4 text-right font-telemetry text-tron-cyan [box-shadow:0_0_15px_rgba(0,243,255,0.2)] backdrop-blur-md">
      {/* static center indicator chevron glowing yellow */}
      <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2 font-black text-tron-yellow [text-shadow:0_0_10px_var(--color-tron-yellow)]">
        {">"}
      </div>

      {/* scrolling container shifting vertically per frame */}
      <div
        className="absolute right-4 top-1/2 flex w-full flex-col"
        style={{ transform: `translateY(calc(-50% + ${offsetPx}px))` }}
      >
        {/* render items to prevent blank gaps during scroll but visually hide the outer elements */}
        {[2, 1, 0, -1, -2].map((offset) => {
          const val = baseAlt + offset;
          // allow dropping to negative bounds
          const isVisible = val >= respawnValues.universalRespawnLimit;

          return (
            <div
              key={offset}
              className={`flex h-6 items-center justify-end gap-1 font-bold tracking-tighter transition-all duration-75 ${
                Math.abs(offset) > 1
                  ? "opacity-0"
                  : Math.abs(offset) === 1
                    ? "text-tron-cyan/40 text-base"
                    : "text-tron-yellow text-xl [text-shadow:0_0_8px_var(--color-tron-yellow)]"
              }`}
            >
              {isVisible ? (
                <>
                  <span>{formatAltitude(val)}</span>
                  <span className="text-[10px] opacity-60">M</span>
                </>
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// main heads up display wrapper
const AllVehiclesHUD = () => {
  // subscribe to active control state to conditionally render ui
  const activeControl = useVehicleStore((state) => state.active.control);

  // subscribe to ui store to control speedometer/instrument visibility
  const showSpeedometers = useUIStore((state) => state.showSpeedometers);

  // subscribe to strict car telemetry from global store via exact entity ID
  const currentCarSpeed = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.CAR_1].speed,
  );

  // subscribe to strict helicopter telemetry from global store via exact entity ID
  const currentHeliAltitude = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.HELI_1].altitude,
  );

  const currentHeliAirspeed = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.HELI_1].airspeed,
  );

  const currentHeliPitch = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.HELI_1].pitch,
  );

  const currentHeliRoll = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.HELI_1].roll,
  );

  const currentHeliYaw = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.HELI_1].yaw,
  );

  // subscribe to strict plane telemetry from global store via exact entity ID
  const currentPlaneAirspeed = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.PLANE_1].airspeed,
  );

  const currentPlaneAltitude = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.PLANE_1].altitude,
  );

  const currentPlanePitch = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.PLANE_1].pitch,
  );

  const currentPlaneRoll = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.PLANE_1].roll,
  );

  const currentPlaneYaw = useVehicleStore(
    (state) => state.telemetry[ENTITY_ID.PLANE_1].yaw,
  );

  // pad speed strings for arcade styling
  const displayCarSpeed = String(currentCarSpeed).padStart(3, "0");
  const displayHeliSpeed = String(currentHeliAirspeed).padStart(3, "0");
  const displayPlaneSpeed = String(currentPlaneAirspeed).padStart(3, "0");

  return (
    // full screen non interactive overlay
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* only render player display if character is player */}
      {activeControl === CONTROL_STATE.PLAYER && (
        <>
          {/* dynamic player controls */}
          <SharedControlsDisplay
            controls={[
              { keys: "WASD", action: "move" },
              { keys: "SHIFT", action: "sprint" },
              { keys: "SPACE", action: "jump" },
            ]}
          />
        </>
      )}

      {/* only render car display if player is actively driving */}
      {activeControl === CONTROL_STATE.CAR && (
        <>
          {/* dynamic car controls */}
          <SharedControlsDisplay
            controls={[
              { keys: "WASD", action: "drive" },
              { keys: "SPACE", action: "brake" },
              { keys: "SHIFT", action: "boost" },
              { keys: "AD", action: "steer/roll" },
            ]}
          />

          {/* inline speedometer */}
          {showSpeedometers && (
            <div className="absolute bottom-6 right-8 flex items-baseline">
              {/* inject live padded speed value with tabular mono font to prevent jumping */}
              <span className="tabular-nums font-telemetry text-6xl font-black italic tracking-tighter text-tron-cyan [text-shadow:0_0_20px_var(--color-tron-cyan)]">
                {displayCarSpeed}
              </span>

              {/* speed unit using strict width to prevent container shifting */}
              <span className="ml-2 inline-block w-14 text-xl font-label font-bold text-tron-cyan/70 [text-shadow:0_0_8px_var(--color-tron-cyan)]">
                KM/H
              </span>
            </div>
          )}
        </>
      )}

      {/* only render helicopter display if player is actively flying */}
      {activeControl === CONTROL_STATE.HELICOPTER && (
        <>
          {/* dynamic helicopter controls */}
          <SharedControlsDisplay
            controls={[
              { keys: "SHIFT/SPACE", action: "ascend/descend" },
              { keys: "WS", action: "pitch" },
              { keys: "AD", action: "roll" },
              { keys: "QE", action: "yaw" },
            ]}
          />

          {showSpeedometers && (
            <>
              {/* advanced aviation instruments container anchored to bottom left */}
              <div className="absolute bottom-6 left-8 flex items-end gap-6">
                {/* dynamic artificial horizon with compass bezel */}
                <AttitudeIndicator
                  pitch={currentHeliPitch}
                  roll={currentHeliRoll}
                  yaw={currentHeliYaw}
                />

                {/* scrolling altimeter tape */}
                <AltimeterTape altitude={currentHeliAltitude} />
              </div>

              {/* inline helicopter airspeed anchored to bottom right */}
              <div className="absolute bottom-6 right-8 flex items-baseline">
                <span className="tabular-nums font-telemetry text-6xl font-black italic tracking-tighter text-tron-cyan [text-shadow:0_0_20px_var(--color-tron-cyan)]">
                  {displayHeliSpeed}
                </span>
                <span className="ml-2 inline-block w-14 text-xl font-label font-bold text-tron-cyan/70 [text-shadow:0_0_8px_var(--color-tron-cyan)]">
                  KTS
                </span>
              </div>
            </>
          )}
        </>
      )}

      {/* only render plane display if player is actively flying */}
      {activeControl === CONTROL_STATE.PLANE && (
        <>
          {/* dynamic plane controls */}
          <SharedControlsDisplay
            controls={[
              { keys: "SHIFT/SPACE", action: "take off/airbrake" },
              { keys: "WS", action: "pitch" },
              { keys: "AD", action: "roll" },
              { keys: "QE", action: "yaw" },
            ]}
          />

          {showSpeedometers && (
            <>
              {/* advanced aviation instruments container anchored to bottom left */}
              <div className="absolute bottom-6 left-8 flex items-end gap-6">
                {/* dynamic artificial horizon with compass bezel */}
                <AttitudeIndicator
                  pitch={currentPlanePitch}
                  roll={currentPlaneRoll}
                  yaw={currentPlaneYaw}
                />

                {/* scrolling altimeter tape */}
                <AltimeterTape altitude={currentPlaneAltitude} />
              </div>

              {/* inline plane airspeed anchored to bottom right */}
              <div className="absolute bottom-6 right-8 flex items-baseline">
                <span className="tabular-nums font-telemetry text-6xl font-black italic tracking-tighter text-tron-cyan [text-shadow:0_0_20px_var(--color-tron-cyan)]">
                  {displayPlaneSpeed}
                </span>
                <span className="ml-2 inline-block w-14 text-xl font-label font-bold text-tron-cyan/70 [text-shadow:0_0_8px_var(--color-tron-cyan)]">
                  KTS
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AllVehiclesHUD;
