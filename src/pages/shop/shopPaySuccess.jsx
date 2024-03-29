import {
  Navbar,
  Toolbar,
  Page,
  Link,
  Button,
  Sheet,
  PageContent,
} from "framework7-react";
import React from "react";
import IconSucces from "../../assets/images/box.svg";
import NotificationIcon from "../../components/NotificationIcon";
import ToolBarBottom from "../../components/ToolBarBottom";
import userService from "../../service/user.service";
import Skeleton from "react-loading-skeleton";
import ReactHtmlParser from "react-html-parser";
import { formatPriceVietnamese } from "../../constants/format";
import Select from "react-select";
import { QRCodeSVG } from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import Dom7 from "dom7";

const RenderQR = ({ ValueBank, Total, ID, MaND }) => {
  if (ValueBank.ma_nh === "ZaloPay") {
    return (
      <div className="mt-15px">
        <QRCodeSVG
          value={`https://social.zalopay.vn/mt-gateway/v1/private-qr?amount=${Total}&note=${MaND}${ID}&receiver_id=${ValueBank.stk}`}
          size={220}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          includeMargin={false}
        />
        <div className="fw-600">{ValueBank.ten}</div>
        <div>{ValueBank.stk}</div>
        <div>{formatPriceVietnamese(Total)}</div>
      </div>
    );
  }
  if (ValueBank.ma_nh === "MoMoPay") {
    return (
      <div className="mt-15px">
        <QRCodeSVG
          value={`2|99|${ValueBank.stk}|||0|0|${Total}|${MaND}${ID}|transfer_myqr`}
          size={220}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          includeMargin={false}
        />
        <div className="fw-600">{ValueBank.ten}</div>
        <div>{ValueBank.stk}</div>
        <div>{formatPriceVietnamese(Total)}</div>
      </div>
    );
  }
  return (
    <div className="mt-12px">
      <div className="position-relative m-auto" style={{ maxWidth: "320px" }}>
        <div className="bg-white position-absolute h-40px w-100 bg-white top-0 left-0"></div>
        <div
          className="text-center fw-600 text-danger"
          style={{
            position: "absolute",
            width: "100%",
            fontSize: "20px",
            top: "8px",
          }}
        >
          Quét mã để thanh toán
        </div>
        <img
          src={`https://img.vietqr.io/image/${ValueBank.ma_nh}-${ValueBank.stk}-compact2.jpg?amount=${Total}&addInfo=${MaND}${ID}&accountName=${ValueBank.ten}`}
          alt="Mã QR Thanh toán"
        />
      </div>
    </div>
  );
};

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      loadingText: false,
      textPay: "",
      Banks: [],
      ValueBank: null,
      MaND: "",
    };

    this.myRef = React.createRef();
  }

  getName = (item) => {
    let names = item.ngan_hang.split("-");
    return names[names.length - 1];
  };

  componentDidMount() {
    this.setState({
      loadingText: true,
    });
    userService
      .getConfig("App.thanhtoan,MA_QRCODE_NGAN_HANG")
      .then(({ data }) => {
        let newBanks = [];
        let newMaND = "";
        if (data.data && data.data.length > 1) {
          let JsonBanks = JSON.parse(data.data[1].Value);
          if (
            JsonBanks &&
            JsonBanks.ngan_hang &&
            Array.isArray(JsonBanks.ngan_hang)
          ) {
            newBanks = JsonBanks.ngan_hang.map((x) => ({
              ...x,
              value: x.stk,
              label: this.getName(x),
            }));
            newMaND = JsonBanks.ma_nhan_dien;
          }
        }
        this.setState({
          textPay: data.data && data.data[0]?.Value,
          loadingText: false,
          Banks: newBanks,
          MaND: newMaND,
          ValueBank: newBanks && newBanks.length > 0 && newBanks[0],
        });
      })
      .catch((error) => console.log(error));
    this.$f7ready((f7) => {
      Dom7("#copy").click(() => {
        this.myRef?.current?.onClick();
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.textPay !== this.state.textPay) {
      Dom7("#copy").click(() => {
        this.myRef?.current?.onClick();
      });
    }
  }

  render() {
    const { loadingText, textPay, Banks, ValueBank, MaND } = this.state;

    return (
      <Page
        onPageBeforeOut={this.onPageBeforeOut}
        onPageBeforeRemove={this.onPageBeforeRemove}
        name="shop-pay-success"
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link href="/news/">
                <i className="las la-home"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Thành công</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-pay-success bg-white min-h-100 p-15px bz-bb">
          <div className="image mb-20px">
            <img
              className="w-125px"
              src={IconSucces}
              alt="Đơn hàng được gửi thành công!"
            />
          </div>
          {/* <div className="text">
            Đơn hàng <span>#{this.$f7route.params.orderID}</span> của bạn đã
            được gửi thành công.
          </div> */}
          <div className="text-center mb-20px">
            <CopyToClipboard
              ref={this.myRef}
              text={`DX${this.$f7route.params?.orderID}`}
              onCopy={() => {
                toast.success("Đã sao chép !", {
                  position: toast.POSITION.TOP_LEFT,
                  autoClose: 1000,
                });
              }}
            >
              <span className="text-primary fw-500 text-underline pr-5px d-none"></span>
            </CopyToClipboard>
            {loadingText && <Skeleton count={5} />}
            {!loadingText && textPay && (
              <div
                style={{
                  fontSize: "15px",
                  lineHeight: "22px",
                }}
              >
                {ReactHtmlParser(
                  textPay
                    .replaceAll(
                      "ID_ĐH",
                      `<b class="fw-600 text-danger">${this.$f7route.params.orderID}</b>`
                    )
                    .replaceAll(
                      "MONEY",
                      `<b class="fw-600 text-danger">${formatPriceVietnamese(
                        Math.abs(this.$f7route.query.money)
                      )} ₫</b>`
                    )
                    .replaceAll(
                      "ID_DH",
                      `<b class="fw-600 text-danger">${this.$f7route.params.orderID}</b>`
                    )
                )}
              </div>
            )}
            <div
              className="mt-10px"
              style={{
                fontSize: "15px",
                lineHeight: "22px",
              }}
            >
              <Select
                options={Banks}
                className="select-control"
                classNamePrefix="select"
                placeholder="Chọn ngân hàng"
                noOptionsMessage={() => "Không có dữ liệu"}
                value={ValueBank}
                onChange={(val) => this.setState({ ValueBank: val })}
                // isClearable={true}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              {ValueBank && (
                <div className="mt-12px">
                  <div>
                    <div
                      style={{ border: "1px solid #e5e7eb", textAlign: "left" }}
                    >
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
                        <div className="p-10px fw-600">{ValueBank.ten}</div>
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
                          {ValueBank.stk}
                          <CopyToClipboard
                            text={ValueBank.value}
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
                        <div className="p-10px fw-600">{ValueBank?.label}</div>
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
                          {formatPriceVietnamese(
                            Math.abs(this.$f7route.query.money)
                          )}{" "}
                          đ
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
                          DX{this.$f7route.params.orderID}
                          <CopyToClipboard
                            text={`DX${this.$f7route.params.orderID}`}
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
                  </div>
                </div>
              )}
            </div>
            {ValueBank && (
              <RenderQR
                ValueBank={ValueBank}
                Total={Math.abs(this.$f7route.query.money)}
                ID={this.$f7route.params.orderID}
                MaND={MaND}
              />
            )}
          </div>
          <div className="btn">
            <Link href="/order/">Đơn hàng của bạn</Link>
            <Link className="mb-0" href="/shop/">
              Tiếp tục mua hàng
            </Link>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
