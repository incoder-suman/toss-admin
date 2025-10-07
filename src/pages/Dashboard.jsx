import { Users, Trophy, Coins, Wallet } from "lucide-react";


export default function Dashboard() {
return (
<div className="space-y-6">
<h1 className="text-2xl font-bold">Dashboard</h1>


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
<Users className="text-cyan-600 mb-2" size={28} />
<p className="text-gray-600">Total Users</p>
<h2 className="text-2xl font-bold">00</h2>
</div>


<div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
<Trophy className="text-cyan-600 mb-2" size={28} />
<p className="text-gray-600">Matches</p>
<h2 className="text-2xl font-bold">00</h2>
</div>


<div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
<Coins className="text-cyan-600 mb-2" size={28} />
<p className="text-gray-600">Active Bets</p>
<h2 className="text-2xl font-bold">00</h2>
</div>


<div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
<Wallet className="text-cyan-600 mb-2" size={28} />
<p className="text-gray-600">Revenue</p>
<h2 className="text-2xl font-bold">₹50,000</h2>
</div>
</div>
</div>
);
}