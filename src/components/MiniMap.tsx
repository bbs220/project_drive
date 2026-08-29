import { useUIStore } from "../stores/useUIStore";

const MiniMap = () => {
  const showMap = useUIStore((state) => state.showMap);
  return (
    <div
      className={`${showMap ? "block" : "hidden"} fixed right-90 top-2 size-60 border-2 border-white z-15 rounded-xl pointer-events-none`}
    ></div>
  );
};
export default MiniMap;
