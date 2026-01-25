// most performing posts
// most imporessions
// add profile visits
// impressions , clicks , views , likes
// top viwed posts , total likes , engagement rate , withdraw money , add Schedule for posts/live

import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGetAnalyticsPageQuery } from "../../redux/api/api";
import { useEffect } from "react";
import {toast} from 'react-toastify';
import moment from 'moment'
import { useSelector } from "react-redux";

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
const ONE_DAY = 1000*3600*24
const sevenDates = Array(7).fill().map((_,i) => moment(Date.now()-(i*ONE_DAY)).format('YYYY-MM-DD')) ;
                  

function DashboardMain() {
  const {user} = useSelector(state => state.auth);

  const [selectedRange, setSelectedRange] = useState(30);
  const [search, setSearch] = useState("");

  const filteredPosts = mockPostReach.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const navigate = useNavigate() ;

  const {data , error , isError , isLoading} = useGetAnalyticsPageQuery() ;

  const [payout , setPayout] = useState(0);
  const [thisMonthReach , setThisMonthReach] = useState(0);
  const [lastMonthReach , setLastMonthReach] = useState(0);

  const [newFollowers , setNewFollowers] = useState(0);
  const [lastFollowers , setLastFollowers] = useState(0);

  const [followerGrowth , setFollowerGrowth] = useState(0);
  const [topEngagedPosts , setTopEngagedPosts] = useState([]);
  const [followerGraphData , setFollowerGraphData] = useState([]);

  const [scheduled , setScheduled] = useState([]);

  const [lastPayouts , setLastPayouts] = useState([]);

  const [commentCount , setCommentCount] = useState(0);
  const [likeCount , setLikeCount] = useState(0);

  useEffect(() => {
    if(data?.data){
      console.log('data' , data.data);
      setThisMonthReach(data.data?.thisMonthReach?.[0]?.count) ;
      setLastMonthReach(data.data?.lastMonthReach?.[0]?.count) ;

      setNewFollowers(data?.data?.newFollowers ?? 0) ;
      setLastFollowers(data?.data?.lastFollowers ?? 0) ;
      setPayout(data?.data?.pendingPayout) ;
      setTopEngagedPosts(data?.data?.topEngagedPosts) ;
      setFollowerGraphData(data.data?.followerGraph) ;
      setScheduled([...data.data?.scheduledPosts , ...data?.data?.scheduledLives]);
    
      setCommentCount(data?.data?.commentCount ?? 0) ;
      setLikeCount(data?.data?.likesCount ?? 0) ;
    }
  } , [data])

  useEffect(()=> {
    if(isError){
      toast.error(error?.data?.message || 'Error fetching analytics data') ;
      console.log('error fetching analytics data' , error);
    }
  } , [error , isError])

  const calcP = (n , d) => {
    return (n/d)*100;
  }
  
  const dates = () => {
    const dateArrays = Array(Number(selectedRange)).fill().map((_,i) => moment(Date.now()-(i*ONE_DAY)).format('YYYY-MM-DD')).reverse() ; 
    
    return dateArrays.map(d => ( followerGraphData.find(e => e._id.slice(0,10) === d) || {count : 0 , _id : d})) ;
  }

  
  return (
    <div className="min-h-screen dark:bg-black bg-white dark:text-white text-slate-900">
      <div className="max-w-7xl mx-auto p-6 ">
        {/* heading */}
        <header className="flex items-center flex-wrap gap-2 justify-between">
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

        <main className="mt-6 grid md:grid-cols-12 grid-cols-1 gap-6 text-black ">
          {/* Left column: Stats + charts */}
          <section className="md:col-span-8 grid-cols-1 space-y-6">
            <div className="grid md:grid-cols-2 gap-4 fade-in"> 
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">Total Followers</div>
                <div className="text-2xl font-bold">{user?.followers}</div>
                <div className="text-xs text-slate-500 mt-1">Total Following: {user?.following} </div>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">Estimated Earnings</div>
                <div className="text-2xl font-bold">₹{payout}</div>
                <div className="text-xs text-slate-500 mt-1">Pending payout: $420</div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 ,transition : {duration : 1} }} 
              className="grid md:grid-cols-3 grid-cols-2 gap-4 ">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">Total Reach (30d)</div>
                <div className="text-2xl font-bold">{thisMonthReach}</div>
                <div className={`text-xs ${calcP(thisMonthReach , lastMonthReach) > 0 ? 'text-green-600' : 'text-red-600' } mt-1`}>
                  {calcP(thisMonthReach , lastMonthReach) == Infinity ? '∞' : calcP(thisMonthReach , lastMonthReach)} % vs last month
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">New Followers</div>
                <div className="text-2xl font-bold">{newFollowers}</div>
                <div className={`text-xs ${calcP(newFollowers , lastFollowers) > 0 ? 'text-green-600' : 'text-red-600' } mt-1`}>
                  {calcP(newFollowers , lastFollowers) == Infinity ? 'no data from last month' : calcP(newFollowers , lastFollowers) + '% vs last month '} 
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-sm text-slate-500">Estimated Earnings</div>
                <div className="text-2xl font-bold">₹{payout}</div>
                <div className="text-xs text-slate-500 mt-1">Pending payout: $420</div>
              </div>

            </motion.div>

            {/* chart */}
            <div className="bg-white rounded-2xl p-4 px-2 shadowLight fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Follower Growth</h3>
                <div className="flex items-center gap-2 ">
                  <select value={selectedRange} onChange={e => setSelectedRange(e.target.value)} className="px-2 py-1 border rounded-md text-sm">
                    <option value={7}>7d</option>
                    <option value={30}>30d</option>
                    <option value={90}>90d</option>
                  </select>
                </div>
              </div>
              <div style={{ height: 220 }} className="-translate-x-5 duration-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dates()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={'_id'} />
                    <YAxis dataKey={'count'} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#a20dfe" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-2 grid-cols-1 gap-4 ">
              <div className="bg-white rounded-2xl p-4 shadow-sm shadowLight">
                <h4 className="font-semibold mb-2">Top Posts by Reach</h4>
                <div className="divide-y">
                  {topEngagedPosts.map(p => (
                    <div key={p?._id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium truncate">{p?.title ?? p?.content?.split(' ').slice(0,3).join(' ')}</div>
                        <div className="text-xs text-slate-500">{p?.createdAt?.slice(0,10)} • {p?.count} engagements</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{p?.engagement?.toLocaleString()}</div> 
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
                        {name: 'Likes', value: Number(likeCount) }, 
                        {name: 'Comments', value: Number(commentCount) }
                      ]} 
                        dataKey="value" nameKey="name" outerRadius={80} cx={'50%'} cy={'50%'} label>  
                        {[{ name: 'Likes' }, { name: 'Comments' }].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend/>
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

          {/* Right column: Monetization, Schedule */}
          <aside className="md:col-span-4 grid-cols-1 space-y-6">
            {/* <div className="bg-white rounded-2xl p-4 shadowLight">
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
            </div> */}

            <div className="bg-white rounded-2xl p-4 shadowLight">
              <h3 className="font-semibold mb-2">Monetization</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Pending Balance</div>
                    <div className="font-bold text-lg">₹{payout}</div>
                  </div>
                  <div>
                    <button className="px-3 py-2 bg-white border rounded-lg hover:shadow hover:shadow-black/40 duration-200">Withdraw</button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">Last 3 payouts</div>
                <div className="divide-y">
                  {lastPayouts.length > 0 ? lastPayouts.map((p) => (
                    <div className="py-2 flex items-center justify-between text-sm"><div>{p.createdAt.slice(0,10)}</div><div>${p.amount}</div></div>
                  )) : (
                    <div className="py-2 flex items-center justify-between text-sm"><div>No payouts yet</div><div></div></div>
                  )} 
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadowLight">
              <h3 className="font-semibold mb-2">Content Calendar</h3>
              <div className="text-sm text-slate-500 mb-2">Scheduled posts & Lives</div>
              <div className="space-y-2">
                {scheduled.map((p) => (
                  <div key={p?._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                    <div className="text-sm  truncate ">{p?.title ?? p?.content } -,{moment(p?.startedAt).format('DD-mm-yyyy hh:mm')}</div>   
                    {p.isLive ? (
                      <div className="text-xs text-red-600">●Live</div>
                    ) : (
                      <div className="text-xs text-slate-400">{p?.host ? 'Live' : 'Post'}</div>
                    )}
                  </div>  
                ))}
{/*                 
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <div className="text-sm">Nov 25 — Post: Building an Ads Manager</div>
                  <div className="text-xs text-slate-400">Draft</div>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <div className="text-sm">Dec 02 — Live: Stream Q&A</div>
                  <div className="text-xs text-green-600">Scheduled</div>
                </div> */}
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

