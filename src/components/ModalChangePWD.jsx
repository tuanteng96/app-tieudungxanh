import React, { useState } from "react";
import { useQuery } from "react-query";
import NewsDataService from "../service/news.service";
import { SERVER_APP } from "../constants/config";
import { getUser } from "../constants/user";
import userService from "../service/user.service";
import { toast } from "react-toastify";
import CopyToClipboard from "react-copy-to-clipboard";
import { formatPriceVietnamese } from "../constants/format";

const fixedContentDomain = (content) => {
  if (!content) return "";
  return content.replace(/src=\"\//g, 'src="' + SERVER_APP + "/");
};

const fixedContentDomainPrice = (content, price) => {
  if (!content) return "";
  return content.replace(/src=\"\//g, 'src="' + SERVER_APP + "/").replace("[MONEY]", formatPriceVietnamese(price));
};

function ModalChangePWD({ onReload }) {
  let [PriceCurrent, setPriceCurrent] = useState(0);
  let UserCurrent = getUser();
  let { data, isLoading } = useQuery({
    queryKey: ["active-user"],
    queryFn: async () => {
      let { data } = await NewsDataService.getDetailNew("1526");
      return data?.data && data?.data.length > 0 ? data?.data[0] : null;
    },
  });

  let Banks = useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      let { data } = await userService.getConfig(
        "MA_QRCODE_NGAN_HANG,tdx_reg_money,"
      );
      let GOI = [];
      if (data.data && data.data.length > 1) {
        let value = data.data[1]?.Value || "";
        let splitValue = value.split(";");
        for (let k of splitValue) {
          GOI.push(k.split(":")[0]);
        }
      }
      return data?.data && data?.data?.length > 0
        ? {
            ...JSON.parse(data.data[0].Value),
            Value: data.data[1]?.Value,
            GOI,
          }
        : null;
    },
    onSuccess: ({ GOI }) => {
      if (GOI && GOI.length > 0) {
        setPriceCurrent(Number(GOI[0]));
      }
    },
  });

  return (
    <div className="h-100 bz-bb pt-20px d--f fd--c">
      <div
        className="text-uppercase mb-15px text-center px-15px"
        style={{
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Kích hoạt tài khoản
      </div>
      <div
        className="grow-1 overflow-auto px-15px"
        style={{
          fontSize: "15px",
          lineHeight: "22px",
        }}
      >
        {data && (
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: fixedContentDomain(data?.Desc),
              }}
            ></div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${
                  Banks?.data?.GOI?.length > 2
                    ? "3"
                    : Banks?.data?.GOI?.length === 1
                    ? "1"
                    : "2"
                },minmax(0,1fr))`,
                gap: "12px",
              }}
            >
              {Banks?.data?.GOI &&
                Banks?.data?.GOI.length > 0 &&
                Banks?.data?.GOI.map((g, i) => (
                  <div
                    key={i}
                    style={{
                      background:
                        PriceCurrent === Number(g)
                          ? "var(--ezs-color)"
                          : "#E4E6EF",
                      color: PriceCurrent === Number(g) ? "#fff" : "#3F4254",
                      fontSize: "17px",
                      fontWeight: "600",
                      textAlign: "center",
                      padding: "10px 2px",
                      borderRadius: "3px",
                      fontFamily: "Archivo Narrow",
                    }}
                    onClick={() => setPriceCurrent(Number(g))}
                  >
                    G {formatPriceVietnamese(Number(g))}
                  </div>
                ))}
            </div>
            {data.Content && (
              <div
                dangerouslySetInnerHTML={{
                  __html: fixedContentDomainPrice(data.Content, PriceCurrent),
                }}
              ></div>
            )}
            {/* <div
              dangerouslySetInnerHTML={{
                __html: fixedContentDomain(
                  data.Content.replaceAll(
                    "[MONEY]",
                    formatPriceVietnamese(PriceCurrent)
                  )
                ),
              }}
            ></div> */}
          </>
        )}

        {Banks.data &&
          Banks.data.ngan_hang &&
          Banks.data.ngan_hang.length > 0 && (
            <>
              {Banks.data.ngan_hang.map((bank, index) => (
                <div key={index}>
                  <div style={{ border: "1px solid #e5e7eb" }}>
                    <div
                      className="text-white p-10px fw-600"
                      style={{ background: "var(--ezs-color)" }}
                    >
                      Thông tin chuyển khoản
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                        borderBottom: "1px solid #e5e7eb",
                        background: "#f4f6f8",
                      }}
                    >
                      <div
                        className="p-10px"
                        style={{
                          borderRight: "1px solid #e5e7eb",
                          fontSize: "14px",
                        }}
                      >
                        Chủ tài khoản
                      </div>
                      <div className="p-10px fw-600">{bank.ten}</div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        className="p-10px"
                        style={{
                          borderRight: "1px solid #e5e7eb",
                          fontSize: "14px",
                        }}
                      >
                        Số tài khoản
                      </div>
                      <div className="p-10px fw-600 position-relative">
                        {bank.stk}
                        <CopyToClipboard
                          text={bank.stk}
                          onCopy={() => {
                            toast.success("Đã sao chép !", {
                              position: toast.POSITION.TOP_LEFT,
                              autoClose: 1000,
                            });
                          }}
                        >
                          <span
                            className="text-white d--f ai--c jc--c"
                            style={{
                              background: "var(--ezs-color)",
                              position: "absolute",
                              width: "30px",
                              height: "30px",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "22px",
                              borderRadius: "100%",
                            }}
                          >
                            <i className="las la-copy"></i>
                          </span>
                        </CopyToClipboard>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                        borderBottom: "1px solid #e5e7eb",
                        background: "#f4f6f8",
                      }}
                    >
                      <div
                        className="p-10px"
                        style={{
                          borderRight: "1px solid #e5e7eb",
                          fontSize: "14px",
                        }}
                      >
                        Ngân hàng
                      </div>
                      <div className="p-10px fw-600">{bank.ngan_hang}</div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        className="p-10px"
                        style={{
                          borderRight: "1px solid #e5e7eb",
                          fontSize: "14px",
                        }}
                      >
                        Số tiền
                      </div>
                      <div className="p-10px fw-600">
                        {formatPriceVietnamese(PriceCurrent)} đ
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                        borderBottom: "1px solid #e5e7eb",
                        background: "#f4f6f8",
                      }}
                    >
                      <div
                        className="p-10px"
                        style={{
                          borderRight: "1px solid #e5e7eb",
                          fontSize: "14px",
                        }}
                      >
                        Nội dung chuyển khoản
                      </div>
                      <div className="p-10px fw-600 position-relative">
                        KHU{UserCurrent?.ID}
                        <CopyToClipboard
                          text={`KHU${UserCurrent?.ID}`}
                          onCopy={() => {
                            toast.success("Đã sao chép !", {
                              position: toast.POSITION.TOP_LEFT,
                              autoClose: 1000,
                            });
                          }}
                        >
                          <span
                            className="text-white d--f ai--c jc--c"
                            style={{
                              background: "var(--ezs-color)",
                              position: "absolute",
                              width: "30px",
                              height: "30px",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "22px",
                              borderRadius: "100%",
                            }}
                          >
                            <i className="las la-copy"></i>
                          </span>
                        </CopyToClipboard>
                      </div>
                    </div>
                    <div
                      className="p-10px text-danger fw-500"
                      style={{
                        fontSize: "13px",
                      }}
                    >
                      *Lưu ý: Nhập nội dung chính xác để được xử lý tự động
                    </div>
                  </div>
                  <div
                    className="position-relative m-auto"
                    style={{ maxWidth: "320px" }}
                  >
                    <div className="bg-white position-absolute h-40px w-100 bg-white top-0 left-0"></div>
                    <img
                      src={`https://img.vietqr.io/image/${bank.ma_nh}-${bank.stk}-compact2.jpg?amount=${PriceCurrent}&addInfo=KHU${UserCurrent?.ID}$&accountName=${bank.ten}`}
                      alt="Mã QR Thanh toán"
                    />
                  </div>
                </div>
              ))}
            </>
          )}
      </div>
      <div className="p-15px" onClick={() => onReload()}>
        <button type="button" className="btn-login btn-me">
          <span>Đã chuyển khoản</span>
        </button>
      </div>
    </div>
  );
}

export default ModalChangePWD;
