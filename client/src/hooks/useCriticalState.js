import useCrisisStore from "../stores/crisisStore";

function useCriticalState() {
  const encryptionPercentage = useCrisisStore(
    (s) => s.crisisState?.encryptionPercentage ?? 0
  );
  return encryptionPercentage > 70;
}

export default useCriticalState;
