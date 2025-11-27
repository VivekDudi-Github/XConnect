// most performing posts
// most imporessions

// promote new post
// run new Advertisement campaign
// impressions , clicks , views , likes

import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const mockFollowerSeries = [
  { date: "2025-10-01", followers: 1200 },
  { date: "2025-10-07", followers: 1375 },
  { date: "2025-10-14", followers: 1400 },
  { date: "2025-10-21", followers: 1675 },
  { date: "2025-10-28", followers: 1800 },
  { date: "2025-11-04", followers: 1950 },
  { date: "2025-11-11", followers: 2100 },
  { date: "2025-11-18", followers: 2270 }
];

const mockPostReach = [
  { id: "p1", title: "How to set up Mediasoup", reach: 25000, engagement: 3400, date: "2025-11-01" },
  { id: "p2", title: "React + Vite tips", reach: 18000, engagement: 2100, date: "2025-10-25" },
  { id: "p3", title: "Building Ads Manager", reach: 12000, engagement: 900, date: "2025-10-10" },
  { id: "p4", title: "Live streaming guide", reach: 30000, engagement: 5200, date: "2025-11-10" }
];

const campaignMock = [
  { id: "c1", name: "Boost Live Stream", status: "Running", impressions: 120000, clicks: 3200, budget: "$120" },
  { id: "c2", name: "Promote Post: Vite Tips", status: "Paused", impressions: 34000, clicks: 900, budget: "$40" }
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];


function DashboardMain() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [search, setSearch] = useState("");

  const filteredPosts = mockPostReach.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const navigate = useNavigate()

  return (
    <div className="min-h-screen dark:bg-black bg-white dark:text-white text-slate-900">
      <div className="max-w-7xl mx-auto p-6 ">
        {/* heading */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="./XConnect_icon.png" alt="" className="size-12 inline-block -translate-y-0.5" />
            <div>
              <h1 className="text-2xl font-semibold">XConnect — Creator Dashboard</h1>
              <p className="text-sm text-slate-500">Overview of analytics, monetization, and campaigns</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="px-3 py-2 rounded-md border custom_Input" />
            </div>
          </div>
        </header>

        <main className="mt-6 grid grid-cols-12 gap-6 text-black ">
          {/* Left column: Stats + charts */}
          <section className="col-span-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 ,transition : {duration : 1} }} 
              className="grid grid-cols-3 gap-4 ">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">Total Reach (30d)</div>
                <div className="text-2xl font-bold">1,254,321</div>
                <div className="text-xs text-green-600 mt-1">+12.4% vs last month</div>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">New Followers</div>
                <div className="text-2xl font-bold">2,270</div>
                <div className="text-xs text-green-600 mt-1">+8.3% vs last month</div>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">Estimated Earnings</div>
                <div className="text-2xl font-bold">$1,820</div>
                <div className="text-xs text-slate-500 mt-1">Pending payout: $420</div>
              </div>
            </motion.div>

            <div className="bg-white rounded-2xl p-4 shadowLight fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Follower Growth</h3>
                <div className="flex items-center gap-2 ">
                  <select value={selectedRange} onChange={e => setSelectedRange(e.target.value)} className="px-2 py-1 border rounded-md text-sm">
                    <option value="7d">7d</option>
                    <option value="30d">30d</option>
                    <option value="90d">90d</option>
                  </select>
                </div>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockFollowerSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="followers" stroke="#a20dfe" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} 
              className="grid grid-cols-2 gap-4 ">
              <div className="bg-white rounded-2xl p-4 shadow-sm shadowLight">
                <h4 className="font-semibold mb-2">Top Posts by Reach</h4>
                <div className="divide-y">
                  {filteredPosts.map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-slate-500">{p.date} • {p.engagement} engagements</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{p.reach.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">reach</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm ">
                <h4 className="font-semibold mb-2">Engagement Breakdown</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie 
                      data={[
                        {name: 'Likes', value: 5400 }, 
                        {name: 'Comments', value: 1200 }, 
                        {name: 'Shares', value: 800 }]} 
                        dataKey="value" nameKey="name" outerRadius={80} label>  
                        {[{ name: 'Likes' }, { name: 'Comments' }, { name: 'Shares' }].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4  shadowLight">
              <h4 className="font-semibold mb-2">Live Stream / Video Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-sm text-slate-500">Peak Viewers</div>
                  <div className="text-xl font-bold">4,200</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-sm text-slate-500">Avg Watch Time</div>
                  <div className="text-xl font-bold">6m 22s</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-sm text-slate-500">Gifts / Tips</div>
                  <div className="text-xl font-bold">$420</div>
                </div>
              </div>
            </motion.div> */}
          </section>

          {/* Right column: Campaigns, Monetization, Schedule */}
          <aside className="col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-4 shadowLight">
              <h3 className="font-semibold mb-2">Campaign Manager</h3>
              <div className="space-y-3">
                {campaignMock.map(c => (
                  <div key={c.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.status} • {c.impressions.toLocaleString()} impressions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{c.budget}</div>
                      <div className="text-xs text-slate-400">{c.clicks} clicks</div>
                    </div>
                  </div>
                ))}

                <button onClick={() => navigate('/dashboard/campaign/create')} className="w-full py-2 rounded-lg bg-indigo-600 text-white">Create Campaign</button> 
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadowLight">
              <h3 className="font-semibold mb-2">Monetization</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Pending Balance</div>
                    <div className="font-bold text-lg">$420</div>
                  </div>
                  <div>
                    <button className="px-3 py-2 bg-white border rounded-lg hover:shadow hover:shadow-black/40 duration-200">Withdraw</button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">Last 3 payouts</div>
                <div className="divide-y">
                  <div className="py-2 flex items-center justify-between text-sm"><div>Oct 20, 2025</div><div>$240</div></div>
                  <div className="py-2 flex items-center justify-between text-sm"><div>Sep 12, 2025</div><div>$180</div></div>
                  <div className="py-2 flex items-center justify-between text-sm"><div>Aug 03, 2025</div><div>$120</div></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadowLight">
              <h3 className="font-semibold mb-2">Content Calendar</h3>
              <div className="text-sm text-slate-500 mb-2">Scheduled posts & campaigns</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <div className="text-sm">Nov 25 — Post: Building an Ads Manager</div>
                  <div className="text-xs text-slate-400">Draft</div>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <div className="text-sm">Dec 02 — Live: Stream Q&A</div>
                  <div className="text-xs text-green-600">Scheduled</div>
                </div>
              </div>

              <button className="mt-3 w-full py-2 rounded-lg bg-white border hover:shadow hover:shadow-slate-600 duration-200">Open Calendar</button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold mb-2 ">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2 rounded-lg border hover:shadow hover:shadow-black/40 duration-200">Boost Post</button>
                <button className="py-2 rounded-lg border hover:shadow hover:shadow-black/40 duration-200">Schedule Live</button>
              </div>
            </div>
          </aside>
        </main>

        <footer className="mt-6 text-xs text-slate-500">• XConnect Footer Prototype UI.</footer>
      </div>
    </div>
  );
}


export default DashboardMain