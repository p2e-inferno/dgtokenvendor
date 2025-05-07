import { BoltIcon, StarIcon } from "@heroicons/react/24/solid";

// Define the props interface
interface UserStatusCardProps {
  userStage: number | undefined;
  userPoints: number;
  userFuel: number;
  stageName: string;
  stageIcon: React.ReactNode;
}

export const UserStatusCard = ({ userPoints, userFuel, stageName, stageIcon }: UserStatusCardProps) => {
  return (
    <div className="card bg-base-200 shadow-xl border border-primary/30">
      <div className="card-body">
        <h2 className="card-title flex justify-between">
          <span>Current Status</span>
          {stageIcon}
        </h2>

        <div className="stats bg-base-100 shadow mt-4">
          <div className="stat">
            <div className="stat-title">Stage</div>
            <div className="stat-value text-primary flex items-center">{stageName}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-base-100 rounded-box p-4 flex flex-col items-center">
            <div className="flex items-center mb-2">
              <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-xl font-bold">{userPoints}</span>
            </div>
            <span className="text-sm text-base-content/70">Points</span>
          </div>

          <div className="bg-base-100 rounded-box p-4 flex flex-col items-center">
            <div className="flex items-center mb-2">
              <BoltIcon className="h-6 w-6 text-orange-500 mr-2" />
              <span className="text-xl font-bold">{userFuel}</span>
            </div>
            <span className="text-sm text-base-content/70">Fuel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
