import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHome } from "react-icons/fa";
import character1 from "./assets/character1.png";
import character2 from "./assets/character2.png";
import cartoon1 from "./assets/cartoon1.png";
import cartoon2 from "./assets/cartoon2.png";
import cartoon3 from "./assets/cartoon3.png";
import cartoon4 from "./assets/cartoon4.png";
import cartoon5 from "./assets/cartoon5.png";
import "./App.css";

const BROKER_URL = "http://127.0.0.1:5000";

export default function App() {
  const [screen, setScreen] = useState("characterSelection");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [filteredServices, setFilteredServices] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [hashText, setHashText] = useState("");
  const [hashType, setHashType] = useState("MD5");
  const [hashValue, setHashValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backgroundElements, setBackgroundElements] = useState<{ top: string; left: string; src: string }[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      console.log("🔁 Fetching services from broker...");
  
      try {
        const res = await fetch(`${BROKER_URL}/get_services`);
        const data = await res.json();
  
        console.log("✅ Broker returned services:", data.services);
        console.log("✅ Broker success status:", data.success);
  
        if (data.success) {
          setServices(data.services); // 👈 Make sure this is being called
        }
      } catch (error) {
        console.error("❌ Failed to fetch services", error);
      }
    };
  
    fetchServices();
  }, []);
  

  useEffect(() => {
    const numElements = 64;
    const stepX = 90 / Math.sqrt(numElements);
    const stepY = 90 / Math.sqrt(numElements);

    const elements = [];
    let count = 0;
    for (let x = 5; x <= 90; x += stepX) {
      for (let y = 5; y <= 90; y += stepY) {
        if (count >= numElements) break;
        elements.push({
          top: `${y}vh`,
          left: `${x}vw`,
          src: [cartoon1, cartoon2, cartoon3, cartoon4, cartoon5][count % 5],
        });
        count++;
      }
    }
    setBackgroundElements(elements);
  }, [selectedCharacter]);

  const selectCharacter = (character: string) => {
    setSelectedCharacter(character);
    setScreen("menu");
    setErrorMessage(null);
    setSearchQuery("");
    setFilteredServices([]);
  };

  const handleSearchLive = (query: string) => {
    console.log("Search Query:", query);
    const matches = services.filter((s) =>
      s.toLowerCase().includes(query.trim().toLowerCase())
    );
    console.log("Filtered Matches:", matches);
    setFilteredServices(matches);
    setErrorMessage(matches.length === 0 ? "❌ No matching service found" : null);
  };
  
  

  const handleSelectService = (service: string) => {
    console.log("🎯 Selected service:", service);
    if (service.toLowerCase().includes("hash")) {
      setScreen("hashGenerator");
    } else if (service.toLowerCase().includes("random")) {
      setScreen("randomNumberGenerator");
    } else {
      setErrorMessage("❌ Service not recognized.");
    }
  };

  const fetchRandomNumber = async () => {
    if (!minValue || !maxValue || parseInt(minValue) >= parseInt(maxValue)) {
      setErrorMessage("❌ Invalid range: Min must be less than Max");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setRandomNumber(null);

    try {
      const res = await fetch(`${BROKER_URL}/get_service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_name: "randomNumberGenerator" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Service not found");

      const response = await fetch(`http://${data.service_ip}:${data.service_port}/random`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_value: parseInt(minValue),
          max_value: parseInt(maxValue),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setRandomNumber(result.random_number);
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage("❌ Could not fetch random number.");
    }
    setLoading(false);
  };

  const fetchHash = async () => {
    if (!hashText) {
      setErrorMessage("❌ Enter some text to hash.");
      return;
    }

    setLoading(true);
    setHashValue(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`${BROKER_URL}/get_service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_name: "hashGenerator" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Hash service not found");


      const response = await fetch(`http://${data.service_ip}:${data.service_port}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: hashText, hash_method: hashType }),
      });

      const result = await response.json();
      if (result.success) {
        setHashValue(result.hash_value);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("❌ Failed to generate hash.");
    }
    setLoading(false);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden transition-all"
      style={{
        backgroundColor: selectedCharacter
          ? selectedCharacter === "Character 1"
            ? "#b3d9ff"
            : "#e6cba8"
          : "#f5efe6",
      }}
    >
      {backgroundElements.map((item, i) => (
        <motion.img
          key={i}
          src={item.src}
          className="floating-item"
          style={{ top: item.top, left: item.left }}
          alt={`Decor ${i}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1 }}
        />
      ))}

      {screen !== "characterSelection" && (
        <button
          onClick={() => setScreen("characterSelection")}
          className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-all flex items-center"
        >
          <FaHome className="text-xl" />
        </button>
      )}

      {screen === "characterSelection" && (
        <motion.div className="flex flex-col items-center z-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Choose Your Character</h1>
          <div className="flex space-x-16">
            <motion.img
              src={character1}
              alt="Character 1"
              className="character-img"
              onClick={() => selectCharacter("Character 1")}
              whileHover={{ scale: 1.1 }}
            />
            <motion.img
              src={character2}
              alt="Character 2"
              className="character-img"
              onClick={() => selectCharacter("Character 2")}
              whileHover={{ scale: 1.1 }}
            />
          </div>
        </motion.div>
      )}

      {screen === "menu" && selectedCharacter && (
        <motion.div className="relative flex flex-col items-center justify-center px-10 py-8">
          <motion.div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-[600px] flex flex-col items-center border border-yellow-500">
            <motion.img
              src={selectedCharacter === "Character 1" ? character1 : character2}
              alt={selectedCharacter}
              className="w-60 h-80 drop-shadow-lg"
            />
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
              {selectedCharacter === "Character 1" ? "Nop" : "Willy"}'s Game Room 🎮
            </h1>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchLive(e.target.value);
              }}
              className="w-full p-3 border rounded-lg text-lg shadow-md mb-3"
              placeholder="Enter a service name..."
            />
           {filteredServices.length > 0 && (
  <div className="w-full mt-4 max-h-40 overflow-y-auto border rounded-md bg-white shadow">
    {filteredServices.map((s, i) => (
      <div
        key={i}
        className="p-2 hover:bg-gray-200 cursor-pointer"
        onClick={() => handleSelectService(s)}
      >
        🔍 {s}
      </div>
    ))}
  </div>
)}

            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          </motion.div>
        </motion.div>
      )}

{screen === "randomNumberGenerator" && (
  <motion.div
    className="relative flex flex-col items-center justify-center px-10 py-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    <motion.div
      className="bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-[600px] flex flex-col items-center border border-yellow-500"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">🎲 Random Number Generator</h1>
      
      <input
        type="number"
        value={minValue}
        onChange={(e) => setMinValue(e.target.value)}
        placeholder="Min Value"
        className="w-full p-3 border rounded-lg text-lg shadow-md mb-3"
      />
      <input
        type="number"
        value={maxValue}
        onChange={(e) => setMaxValue(e.target.value)}
        placeholder="Max Value"
        className="w-full p-3 border rounded-lg text-lg shadow-md mb-3"
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-green-500 hover:bg-green-700 py-3 rounded-lg text-lg font-semibold shadow-md cursor-pointer transition-all"
        onClick={fetchRandomNumber}
      >
        🎰 Generate Number
      </motion.button>

      {loading && <p className="mt-4 text-blue-500 font-semibold">⏳ Loading...</p>}
      {randomNumber !== null && (
        <p className="text-2xl font-semibold text-green-700 mt-6">
          🎉 Random Number: {randomNumber}
        </p>
      )}
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
    </motion.div>
  </motion.div>
)}

{screen === "hashGenerator" && (
  <motion.div
    className="relative flex flex-col items-center justify-center px-10 py-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    <motion.div
      className="bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-[600px] flex flex-col items-center border border-yellow-500"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Hash Generator</h1>
      
      <input
        type="text"
        value={hashText}
        onChange={(e) => setHashText(e.target.value)}
        className="w-full p-3 border rounded-lg text-lg shadow-md mb-3"
        placeholder="Enter text to hash..."
      />

      <select
        value={hashType}
        onChange={(e) => setHashType(e.target.value)}
        className="w-full p-3 border rounded-lg text-lg shadow-md mb-3"
      >
        <option value="MD5">MD5</option>
        <option value="SHA1">SHA-1</option>
        <option value="SHA256">SHA-256</option>
      </select>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-purple-500 hover:bg-purple-700 py-3 rounded-lg text-lg font-semibold shadow-md cursor-pointer transition-all"
        onClick={fetchHash}
      >
        🔑 Generate Hash
      </motion.button>

      {/* Updated styling to keep the hash inside the white container */}
      {hashValue && (
        <div className="w-full mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center break-words">
          <p className="text-lg font-semibold text-green-700">Hash:</p>
          <p className="text-md text-gray-800 break-all">{hashValue}</p>
        </div>
      )}
    </motion.div>
  </motion.div>
)}

    </div>
  );
}
