export const RecentActivitySkeleton = () => (
  <div className="bg-base-200 p-6 rounded-xl">
    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Type</th>
            <th>Details</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-300 rounded w-48"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
