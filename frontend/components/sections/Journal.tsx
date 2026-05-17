"use client";

import { useState, useEffect } from "react";
import { S, modalOverlay, modalBox, labelStyle, JOURNAL_ENTRIES } from "@/constants/styles";

interface JournalEntry {
  id: number;
  date: string;
  mood: string;
  title: string;
  preview: string;
  content?: string;
}

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMoodFilter, setActiveMoodFilter] = useState("All");

  // Creation Modal States
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    date: "",
    mood: "😊 Good",
    content: "",
  });

  const moods = ["All", "😊 Good", "🔥 Energized", "😐 Neutral", "😴 Tired", "😞 Rough"];

  // Initialize and load from local storage
  useEffect(() => {
    const local = localStorage.getItem("devtrack_journal");
    let loaded: JournalEntry[] = [];
    if (local) {
      try {
        loaded = JSON.parse(local);
      } catch (e) {
        console.error("Error loading journal entries", e);
      }
    }

    // Seed preset data if local storage is empty
    if (!loaded || loaded.length === 0) {
      loaded = JOURNAL_ENTRIES.map(item => ({
        ...item,
        content: item.preview // Pre-fill full content with the preview text as a starting point
      }));
      localStorage.setItem("devtrack_journal", JSON.stringify(loaded));
    }

    setEntries(loaded);
    if (loaded.length > 0) {
      setSelectedId(loaded[0].id);
    }
  }, []);

  // Listen for the custom "New Entry" Topbar trigger
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.section === "journal") {
        // Set default date to today
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        setNewEntry({
          title: "",
          date: todayStr,
          mood: "😊 Good",
          content: "",
        });
        setShowModal(true);
      }
    };

    window.addEventListener("trigger-create", handleTrigger);
    return () => window.removeEventListener("trigger-create", handleTrigger);
  }, []);

  // Actions
  const handleSaveEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      alert("Title and content are required to create a journal entry!");
      return;
    }

    const created: JournalEntry = {
      id: Date.now(),
      title: newEntry.title,
      date: newEntry.date || new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      mood: newEntry.mood,
      preview: newEntry.content.substring(0, 100) + (newEntry.content.length > 100 ? "..." : ""),
      content: newEntry.content,
    };

    const updated = [created, ...entries];
    setEntries(updated);
    localStorage.setItem("devtrack_journal", JSON.stringify(updated));
    setSelectedId(created.id);
    setShowModal(false);
  };

  const handleDeleteEntry = (id: number) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem("devtrack_journal", JSON.stringify(updated));
    
    if (updated.length > 0) {
      setSelectedId(updated[0].id);
    } else {
      setSelectedId(null);
    }
  };

  // Filter and search entries
  const filtered = entries
    .filter(e => {
      if (activeMoodFilter === "All") return true;
      return e.mood === activeMoodFilter;
    })
    .filter(e => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) || (e.content || e.preview).toLowerCase().includes(q);
    });

  const activeEntry = entries.find(e => e.id === selectedId) || null;

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 120px)", overflow: "hidden" }}>
      
      {/* Left Sidebar Pane: List of Journal Entries */}
      <div style={{ width: 300, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: "0.5px solid rgba(0,0,0,0.08)", paddingRight: 16 }}>
        
        {/* Search */}
        <input
          style={{ ...S.input, marginBottom: 10 }}
          placeholder="🔍 Search entries..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        {/* Mood filter pills */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 8, marginBottom: 12, flexShrink: 0, scrollbarWidth: "none" }}>
          {moods.map(m => (
            <div
              key={m}
              style={{
                ...S.pill(activeMoodFilter === m),
                padding: "3px 10px",
                fontSize: 10,
                whiteSpace: "nowrap",
              }}
              onClick={() => setActiveMoodFilter(m)}
            >
              {m.split(" ")[0]}
            </div>
          ))}
        </div>

        {/* Entries list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "#888780", fontSize: 13 }}>
              No entries found
            </div>
          ) : (
            filtered.map(e => {
              const active = e.id === selectedId;
              return (
                <div
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: active ? "#E1F5EE" : "#fff",
                    border: active ? "0.5px solid #9FE1CB" : "0.5px solid rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888780", marginBottom: 4 }}>
                    <span>{e.date}</span>
                    <span style={{ fontSize: 12 }}>{e.mood.split(" ")[0]}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#0F6E56" : "#1a1a18", marginBottom: 4 }}>
                    {e.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#5F5E5A", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
                    {e.content || e.preview}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick entry footer button */}
        <button
          style={{ ...S.btn(true), width: "100%", justifyContent: "center", marginTop: 12, flexShrink: 0 }}
          onClick={() => {
            const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            setNewEntry({
              title: "",
              date: todayStr,
              mood: "😊 Good",
              content: "",
            });
            setShowModal(true);
          }}
        >
          + Write New Entry
        </button>
      </div>

      {/* Right Detail Pane: Entry Viewer */}
      <div style={{ flex: 1, overflowY: "auto", paddingLeft: 10, display: "flex", flexDirection: "column" }}>
        {activeEntry ? (
          <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "24px 28px", flex: 1, display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "0.5px solid rgba(0,0,0,0.08)", paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontStyle: "italic", fontWeight: 400, color: "#1a1a18", margin: "0 0 6px 0" }}>
                  {activeEntry.title}
                </h1>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#888780", fontFamily: "monospace" }}>
                    📅 {activeEntry.date}
                  </span>
                  <span style={{ ...S.tag("personal"), background: "#E1F5EE", color: "#0F6E56", fontSize: 11 }}>
                    {activeEntry.mood}
                  </span>
                </div>
              </div>
              <button
                style={{ ...S.iconBtn, color: "#E24B4A", padding: "6px 8px" }}
                onClick={() => handleDeleteEntry(activeEntry.id)}
                title="Delete entry"
              >
                🗑
              </button>
            </div>

            {/* Reflection Body */}
            <div style={{ flex: 1, fontFamily: "inherit", fontSize: 14, color: "#2c2c2a", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {activeEntry.content || activeEntry.preview}
            </div>

            <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)", paddingTop: 14, marginTop: 24, fontSize: 11, color: "#888780", fontStyle: "italic", display: "flex", justifyContent: "space-between" }}>
              <span>Personal Development Tracker · Journaling Module</span>
              <span>ID: #{activeEntry.id}</span>
            </div>

          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "#888780", background: "#fff", borderRadius: 12, border: "0.5px solid rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📓</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Select a journal entry or click + Write New Entry to reflect.</div>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={{ ...modalBox, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              New Journal Entry
            </div>

            <label style={labelStyle}>Date / Header</label>
            <input
              style={{ ...S.input, marginBottom: 12 }}
              placeholder="e.g. Wed, May 13"
              value={newEntry.date}
              onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))}
            />

            <label style={labelStyle}>Title</label>
            <input
              style={{ ...S.input, marginBottom: 12 }}
              placeholder="e.g. Completed Tasks & Weekly Review"
              value={newEntry.title}
              onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))}
            />

            <label style={labelStyle}>How is your mood today?</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {moods.slice(1).map(mood => {
                const isSelected = newEntry.mood === mood;
                return (
                  <button
                    key={mood}
                    style={S.moodChip(isSelected)}
                    onClick={() => setNewEntry(p => ({ ...p, mood }))}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>

            <label style={labelStyle}>Write your reflections...</label>
            <textarea
              style={{
                ...S.input,
                height: 150,
                resize: "none",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
              placeholder="What went well today? What challenges did you solve? What is the plan for tomorrow?"
              value={newEntry.content}
              onChange={e => setNewEntry(p => ({ ...p, content: e.target.value }))}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={S.btn(false)} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={S.btn(true)} onClick={handleSaveEntry}>Create Log</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}