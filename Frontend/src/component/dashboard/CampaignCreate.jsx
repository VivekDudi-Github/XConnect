import React, { useState } from "react";
import { Image as ImageIcon, MessageSquare, FileText, Calendar, Target } from "lucide-react";

export default function CreateCampaignPage() {
  const [tab, setTab] = useState("post");

  // Basic campaign details
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("awareness");
  const [notes, setNotes] = useState("");

  // Audience
  const [locations, setLocations] = useState("");
  const [ageFrom, setAgeFrom] = useState(18);
  const [ageTo, setAgeTo] = useState(45);
  const [interests, setInterests] = useState("");
  const [gender, setGender] = useState("any");

  // Content selection
  const [selectedExisting, setSelectedExisting] = useState("");
  const [uploadedBanner, setUploadedBanner] = useState(null);

  // Plan & schedule
  const [plan, setPlan] = useState("Standard");
  const [startAt, setStartAt] = useState("");

  const requiredFilled = campaignName.trim() !== "" && selectedExisting !== "" && plan;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto ">
      <h1 className="text-3xl font-bold dark:text-white">Create Campaign</h1>

      {/* Basic Details */}
      <div className="bg-white border dark:border-gray-800 rounded-xl dark:shadow-slate-700 p-6 shadow-sm space-y-4 shadowLight dark:bg-black dark:text-white ">
        <h2 className="text-xl font-semibold">Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block  text-sm font-medium mb-1">Campaign Name</label>
            <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" placeholder="e.g. Boost New Feature Post" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 e">Objective</label>
            <select value={objective} onChange={(e) => setObjective(e.target.value)} className="border p-3 rounded-lg w-full dark:bg-black dark:text-white dark:border-gray-800">
              <option value="awareness">Awareness (views)</option>
              <option value="traffic">Traffic (clicks)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (internal)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes for this campaign" className="border p-3 rounded-lg w-full min-h-[80px] dark:bg-black dark:text-white dark:border-gray-800 custom_Input" />
        </div>
      </div>

      {/* Promotion Type */}
      <div className="bg-white border dark:border-gray-800 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight">
        <h2 className="text-xl font-semibold">Promotion Type</h2>

        {/* Tabs */}
        <div className="flex gap-3 border-b pb-2">
          <button
            onClick={() => setTab("post")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${tab === "post" ? "bg-gray-900 dark:bg-white dark:text-black text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 "}`}
          >
            <FileText size={18} /> Ad Post
          </button>

          <button
            onClick={() => setTab("comment")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${tab === "comment" ? "bg-gray-900 dark:bg-white dark:text-black text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 "}`}
          >
            <MessageSquare size={18} /> Ad Comment
          </button>

          <button
            onClick={() => setTab("banner")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${tab === "banner" ? "bg-gray-900 dark:bg-white dark:text-black text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 "}`}
          >
            <ImageIcon size={18} /> Ad Banner
          </button>
        </div>

        {/* Content Switch */}
        <div className="space-y-4">
          <label className="font-medium">Choose from existing or create new</label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={selectedExisting} onChange={(e) => setSelectedExisting(e.target.value)} className="border dark:border-gray-800 p-3 rounded-lg w-full dark:bg-black dark:text-white">
              <option value="">Select existing...</option>
              <option value="post1">Post #1 — Promo</option>
              <option value="post2">Post #2 — Sale</option>
              <option value="comment1">Comment #1</option>
              <option value="banner1">Banner #1</option>
            </select>

            {/* dynamic input based on tab */}
            {tab === "post" && <textarea placeholder="Write promotional post..." className="border p-3 rounded-lg w-full min-h-[80px] dark:bg-black dark:text-white dark:border-gray-800 custom_Input" />}
            {tab === "comment" && <textarea placeholder="Write promotional comment..." className="border p-3 rounded-lg w-full min-h-[80px] dark:bg-black dark:text-white dark:border-gray-800 custom_Input" />}
            {tab === "banner" && (
              <div className="space-y-2">
                <input type="file" accept="image/*" onChange={(e) => setUploadedBanner(e.target.files?.[0] || null)} className="border p-3 rounded-lg w-full" />
                {uploadedBanner && <div className="text-sm text-gray-600">Selected: {uploadedBanner.name}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="bg-white border dark:border-gray-800 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight">
        <h2 className="text-xl font-semibold">Target Audience</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:border-gray-800 ">Locations (comma separated)</label>
            <input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="e.g. India, United States" className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Interests (comma separated)</label>
            <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Tech, Gaming" className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 ">Age From</label>
            <input type="number" value={ageFrom} min={13} max={100} onChange={(e) => setAgeFrom(Number(e.target.value))} className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age To</label>
            <input type="number" value={ageTo} min={13} max={100} onChange={(e) => setAgeTo(Number(e.target.value))} className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800">
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Views Plan */}
      <div className="bg-white border dark:border-gray-800 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight">
        <h2 className="text-xl font-semibold">Choose Views Plan (no end date)</h2>
        <p className="text-sm text-gray-600">Plans are prepaid — campaign runs until the purchased view quota is exhausted or you pause it. You can schedule start time below.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {[{ name: "Basic", views: "10,000 views", price: "₹499" }, { name: "Standard", views: "50,000 views", price: "₹1,499" }, { name: "Premium", views: "200,000 views", price: "₹4,999" }].map((p) => (
            <div key={p.name} onClick={() => setPlan(p.name)} className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer ${plan === p.name ? "ring-2 ring-black dark:ring-white" : ""}`}>
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.views}</p>
              <p className="text-xl font-bold mt-2">{p.price}</p>
              <div className="mt-3">
                <button className={`w-full py-2 rounded-lg ${plan === p.name ? " dark:text-black dark:bg-white bg-slate-300" : "bg-black text-white"}`}>{plan === p.name ? "Selected" : "Select"}</button> 
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white border dark:border-gray-800 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight ">
        <h2 className="text-xl font-semibold">Schedule Campaign</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Placement</label>
            <select className="border p-3 rounded-lg w-full custom_Input dark:bg-black dark:border-gray-800">
              <option>Feed</option>
              <option>Stories</option>
              <option>Banner</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600">If start date is empty campaign will start immediately after purchase.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={() => {}}
          className={`flex-1 px-5 py-3 rounded-xl font-semibold  text-black bg-white hover:bg-slate-200 transition-all shadow-lg`}
        >
          Save Draft
        </button>
        <button
          onClick={() => {}}
          className={`flex-1 px-5 py-3 rounded-xl font-semibold  text-white bg-slate-700 hover:bg-slate-600 transition-all shadow-lg`}
        >
          Start Campaign
        </button>
      </div>
    </div>
  );
}
