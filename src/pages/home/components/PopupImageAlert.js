import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import NewsDataService from "../../../service/news.service";
import { SERVER_APP } from "../../../constants/config";
import { getUser } from "../../../constants/user";

function PopupImageAlert({ f7, visible, onClose}) {

  if (!visible) return <></>;

  return createPortal(
    <div
      className="d--f ai--c jc--c"
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        zIndex: "10001",
        top: 0,
        left: 0,
      }}
    >
      <div className="actions-backdrop backdrop-in" onClick={onClose}></div>
      <div
        style={{
          position: "relative",
          zIndex: "120001",
          maxWidth: "100%",
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            cursor: "pointer",
            userSelect: "none",
            lineHeight: 40,
            height: 45,
            width: 45,
            display: "flex",
            WebkitBoxAlign: "center",
            alignItems: "center",
            WebkitBoxPack: "center",
            justifyContent: "center",
            position: "absolute",
            boxSizing: "border-box",
            top: "-20px",
            right: "20px",
            borderRadius: 20,
          }}
        >
          <svg
            viewBox="0 0 16 16"
            stroke="#ffffff"
            style={{
              width: "25px",
              height: "25px",
              stroke: "#fff",
              strokeWidth: "1px",
            }}
          >
            <path strokeLinecap="round" d="M1.1,1.1L15.2,15.2" />
            <path strokeLinecap="round" d="M15,1L0.9,15.1" />
          </svg>
        </div>
        <img
          className="w-100"
          src={SERVER_APP + "/App2021/images/pop-image-member.gif"}
        />
      </div>
    </div>,
    document.getElementById("framework7-root")
  );
}

export default PopupImageAlert;
