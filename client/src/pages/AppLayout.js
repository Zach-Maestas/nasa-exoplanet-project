import React from "react";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Appear, Frame } from "arwes"; // Adjust based on latest Arwes components

import usePlanets from "../hooks/usePlanets.js";
import useLaunches from "../hooks/useLaunches.js";

import Centered from "../components/Centered.js";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";

import Launch from "./Launch.js";
import History from "./History.js";
import Upcoming from "./Upcoming.js";

const AppLayout = () => {
  const [frameVisible, setFrameVisible] = useState(true);

  const animateFrame = () => {
    setFrameVisible(false);
    setTimeout(() => {
      setFrameVisible(true);
    }, 600);
  };

  const onSuccessSound = () => {
    const audio = new Audio('/sound/success.mp3'); // Path should be relative to the public folder
    audio.play().catch((error) => {
      console.error('Audio playback error:', error);
    });
  };
  const onAbortSound = () => {
    const audio = new Audio('/sound/abort.mp3'); // Path should be relative to the public folder
    audio.play().catch((error) => {
      console.error('Audio playback error:', error);
    });
  };
  const onFailureSound = () => console.log("Failure sound");

  const { launches, isPendingLaunch, submitLaunch, abortLaunch } = useLaunches(
    onSuccessSound,
    onAbortSound,
    onFailureSound
  );

  const planets = usePlanets();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", margin: "auto" }}>
      <Header onNav={animateFrame} />
      <Centered style={{ flex: 1, paddingTop: "20px", paddingBottom: "10px" }}>
        <Appear>
          <Frame
            animate
            visible={frameVisible}
            corners={4}
            style={{ visibility: frameVisible ? "visible" : "hidden" }}
          >
            <div style={{ padding: "20px" }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Launch
                      planets={planets}
                      submitLaunch={submitLaunch}
                      isPendingLaunch={isPendingLaunch}
                    />
                  }
                />
                <Route
                  path="/launch"
                  element={
                    <Launch
                      planets={planets}
                      submitLaunch={submitLaunch}
                      isPendingLaunch={isPendingLaunch}
                    />
                  }
                />
                <Route
                  path="/upcoming"
                  element={<Upcoming launches={launches} abortLaunch={abortLaunch} />}
                />
                <Route
                  path="/history"
                  element={<History launches={launches} />}
                />
              </Routes>
            </div>
          </Frame>
        </Appear>
      </Centered>
      <Footer />
    </div>
  );
};

export default AppLayout;
