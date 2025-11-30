import React, { useEffect, useState } from "react";
import { Image as ImageIcon, MessageSquare, FileText, Calendar, Target , XIcon, PlusCircleIcon, PlusIcon } from "lucide-react";
import PostCard from "../post/PostCard";
import CampaignDummyPostCard from "./CampaignPostCard";
import TextArea from 'react-textarea-autosize'
import {toast} from 'react-toastify';

export default function CreateCampaignPage() {
  const [tab, setTab] = useState("post");

  // Basic campaign details
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("awareness");
  const [notes, setNotes] = useState("");

  // Audience

  const [locations, setLocations] = useState("");
  const [tags, setTags] = useState([]);
  const [tagsVal, setTagsVal] = useState("");
  const [gender, setGender] = useState("any");

  // Content selection
  const [selectedExisting, setSelectedExisting] = useState("");
  const [uploadedBanner, setUploadedBanner] = useState(null);
  const [UploadPostPic, setUploadPostPic] = useState([]);

  const [content , setContent] = useState("");

  const [posts , setPosts] = useState([]) ;
  const [comments , setComments] = useState([]) ;

  // Plan & schedule
  const [plan, setPlan] = useState("Standard");
  const [startAt, setStartAt] = useState("");

  const requiredFilled = campaignName.trim() !== "" && selectedExisting !== "" && plan;

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };
  
  const removePostPic = (pic) => {
    setUploadPostPic(UploadPostPic.filter((p) => p.name !== pic.name));
  };

  const addPostPic = (pic) => {
    if(UploadPostPic.length >= 5){
      toast.error('Maximum 5 images allowed');
      return;
    }
    setUploadPostPic([...UploadPostPic, pic]);
  };

  useEffect(() => {
    if(tagsVal.at(-1) === ' '){
      tags.length > 10 ? toast.error('Maximum 10 tags allowed') : setTags([...tags, tagsVal.trim()]);
      setTagsVal("");
    }
  } , [tagsVal , tags])

  const addContent = () => {
    let post = {
      content : description ,
    }
    setPosts([...posts , p]);
  }
  
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto ">
      <h1 className="text-3xl font-bold dark:text-white">Create Campaign</h1>

      {/* Basic Details */}
      <div className="bg-white border dark:border-gray-700 rounded-xl dark:shadow-slate-700 p-6 shadow-sm space-y-4 shadowLight dark:bg-black dark:text-white ">
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
      </div>

      {/* Promotion Type */}
      <div className="bg-white border dark:border-gray-700 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight">
        <h2 className="text-xl font-semibold">Promotion Type</h2>

        {/* Tabs */}
        <div className="flex gap-3 border-b pb-2 w-full overflow-scroll "> 
          <button
            onClick={() => setTab("post")}
            className={`px-2 py-2 rounded-lg flex items-center gap-2 ${tab === "post" ? "bg-gray-900 dark:bg-white dark:text-black text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 "}`}
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
          <div className="font-medium flex items-center gap-2 ">
            Choose from existing or
            <button onClick={addContent} className="bg-white text-black rounded-lg active:scale-95 duration-200 flex p-1 ">
              Create New <PlusIcon />
            </button>
          </div> 
          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            
            {/* dynamic input based on tab */}
            {tab === "post" && (
              <>
                <label >Description
                  <TextArea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write promotional post..." className="border p-3 rounded-lg w-full min-h-[80px] dark:bg-black dark:text-white dark:border-gray-800 custom_Input" />
                </label>
                <input type="file" accept="image/*" onChange={(e) => addPostPic(e.target.files?.[0] || null)} className="border p-3 rounded-lg w-full" />
                
                {UploadPostPic && 
                <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-1">
                  Selected: 
                  {UploadPostPic.map((pic) => (
                    <span className="flex items-center  text-sm text-gray-600 dark:text-gray-400 relative h-full w-full">
                      <img src={URL.createObjectURL(pic)} alt="" className=" min-h-16 min-w-16  h-full w-full rounded-md object-cover" />  
                      <XIcon className="absolute right-2 top-2 z-50 text-white bg-gray-900/50 rounded-full" size={17} onClick={() => removePostPic(pic)} />
                    </span>
                  ))} 
                </div>}
                  <CampaignDummyPostCard post={{content , media : UploadPostPic.map(p => {
                    return {
                      url : URL.createObjectURL(p) ,
                      public_id : p.name ,
                      type : 'image' ,
                    }
                  }) }} />
                {posts.map((p , i) => (
                  <CampaignDummyPostCard post={p} />
                ))}
              </>
            )}
            {tab === "comment" && (
              <label>Description
                <TextArea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write promotional post..." className="border p-3 rounded-lg w-full min-h-[80px] dark:bg-black dark:text-white dark:border-gray-800 custom_Input" />
              </label>
            )}
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
      <div className="bg-white border dark:border-gray-700 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight">
        <h2 className="text-xl font-semibold">Target Audience</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:border-gray-800 ">Locations (space separated)</label>
            <input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="e.g. India, United States" className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input value={tagsVal} onChange={(e) => setTagsVal(e.target.value)} placeholder="e.g. Tech, Gaming" className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800" />
            {/* Tag List */}
            <div className="flex flex-wrap gap-2 my-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 dark:bg-white dark:text-black white px-3 py-1 rounded-full text-sm fade-in duration-200 shadowLight"
                >
                {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-black hover:text-red-300"
                  >
                    <XIcon size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} 
              className="border p-3 rounded-lg w-full custom_Input dark:border-gray-800 dark:bg-black dark:text-white ">
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Views Plan */}
      <div className="bg-white border dark:border-gray-700 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight">
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
      <div className="bg-white border dark:border-gray-700 dark:bg-black dark:text-white rounded-xl p-6 shadow-sm space-y-6 shadowLight ">
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
