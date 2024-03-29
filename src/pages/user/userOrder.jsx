import React, { useEffect } from "react";
import {
  Page,
  Link,
  Toolbar,
  Navbar,
  Sheet,
  Button,
  PageContent,
  Subnavbar,
  Tabs,
  Tab,
} from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import NotificationIcon from "../../components/NotificationIcon";
import { getUser, getPassword } from "../../constants/user";
import PageNoData from "../../components/PageNoData";
import {
  formatPriceVietnamese,
  checkImageProduct,
} from "../../constants/format";
import Skeleton from "react-loading-skeleton";
import ReactHtmlParser from "react-html-parser";
import moment from "moment";
import "moment/locale/vi";
import clsx from "clsx";
moment.locale("vi");
import Select from "react-select";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import MenuOrder from "./components/MenuOrder";
import OrderFilter from "./components/OrderFilter";

const RenderQR = ({ ValueBank, Total, ID, MaND }) => {
  if (ValueBank.ma_nh === "ZaloPay") {
    return (
      <div className="mt-15px d-flex justify-content-center align-items-center fd--c">
        <QRCodeSVG
          value={`https://social.zalopay.vn/mt-gateway/v1/private-qr?amount=${Total}&note=${MaND}${ID}&receiver_id=${ValueBank.stk}`}
          size={220}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          includeMargin={false}
        />
        <div className="fw-600 mt-15px">{ValueBank.ten}</div>
        <div>{ValueBank.stk}</div>
        <div>{formatPriceVietnamese(Total)}</div>
      </div>
    );
  }
  if (ValueBank.ma_nh === "MoMoPay") {
    return (
      <div className="mt-15px d-flex justify-content-center align-items-center fd--c">
        <QRCodeSVG
          value={`2|99|${ValueBank.stk}|||0|0|${Total}|${MaND}${ID}|transfer_myqr`}
          size={220}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          includeMargin={false}
        />
        <div className="fw-600 mt-15px">{ValueBank.ten}</div>
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

const SheetOrder = ({ item, textPay, loadingText, Banks, MaND }) => {
  const [ValueBank, setValueBank] = useState(null);

  useEffect(() => {
    if (Banks && Banks.length > 0) {
      setValueBank(Banks[0]);
    }
  }, [Banks]);

  let TotalDebt = Math.abs(
    item.thanhtoan.tong_gia_tri_dh -
      item.thanhtoan.thanh_toan_tien -
      item.thanhtoan.thanh_toan_vi -
      item.thanhtoan.thanh_toan_ao
  );

  return (
    <Sheet
      className={`demo-sheet-${item.ID} sheet-detail`}
      style={{
        height: "auto !important",
        "--f7-sheet-bg-color": "#fff",
      }}
      backdrop
    >
      <Button sheetClose={`.demo-sheet-${item.ID}`} className="show-more">
        <i className="las la-times"></i>
      </Button>
      <PageContent>
        <div
          className="page-shop__service-detail"
          style={{
            background: "#fff",
            fontSize: "15px",
            lineHeight: "22px",
          }}
        >
          <div className="title">
            <h4>Thanh toán đơn hàng #{item.ID}</h4>
          </div>
          <div className="content">
            {loadingText && <Skeleton count={6} />}
            {!loadingText &&
              textPay &&
              ReactHtmlParser(
                textPay
                  .replaceAll(
                    "ID_ĐH",
                    `<b class="fw-600 text-danger">${item?.ID}</b>`
                  )
                  .replaceAll(
                    "MONEY",
                    `<b class="fw-600 text-danger">${formatPriceVietnamese(
                      Math.abs(item?.ToPayClient)
                    )} ₫</b>`
                  )
                  .replaceAll(
                    "ID_DH",
                    `<b class="fw-600 text-danger">${item?.ID}</b>`
                  )
              )}
            <div>
              <div className="mt-10px">
                <Select
                  options={Banks}
                  className="select-control"
                  classNamePrefix="select"
                  placeholder="Chọn ngân hàng"
                  noOptionsMessage={() => "Không có dữ liệu"}
                  value={ValueBank}
                  onChange={(val) => setValueBank(val)}
                  isClearable={true}
                  // menuPosition="fixed"
                  // styles={{
                  //   menuPortal: (base) => ({
                  //     ...base,
                  //     zIndex: 9999,
                  //   }),
                  // }}
                  // menuPortalTarget={document.body}
                  menuPlacement="top"
                />
              </div>
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
                          {formatPriceVietnamese(Math.abs(item?.ToPayClient))} đ
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
                          DX{item?.ID}
                          <CopyToClipboard
                            text={`DX${item?.ID}`}
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

              {ValueBank && (
                <RenderQR
                  ValueBank={ValueBank}
                  Total={item?.ToPayClient}
                  ID={item.ID}
                  MaND={MaND}
                />
              )}
            </div>
          </div>
        </div>
      </PageContent>
    </Sheet>
  );
};

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrOder: [],
      loading: false,
      loadingText: false,
      textPay: "",
      Banks: null,
      MaND: "",
      active: "all",
      isFilter: false,
      filters: {
        OrderID: "",
        Desc: "",
      },
      van_chuyen: [],
      list: [],
      data: [
        {
          key: "all",
          title: "Tất cả",
          items: [],
        },
        {
          key: "pending",
          title: "Đang xử lý",
          items: [],
        },
        {
          key: "cancel",
          title: "Đã huỷ",
          items: [],
        },
        {
          key: "finish",
          title: "Thành công",
          items: [],
        },
      ],
      init: [
        {
          key: "all",
          title: "Tất cả",
          items: [],
        },
        {
          key: "pending",
          title: "Đang xử lý",
          items: [],
        },
        {
          key: "cancel",
          title: "Đã huỷ",
          items: [],
        },
        {
          key: "finish",
          title: "Thành công",
          items: [],
        },
      ],
    };
  }

  getName = (item) => {
    let names = item.ngan_hang.split("-");
    return names[names.length - 1];
  };

  componentDidMount() {
    this.getOrderAll();

    this.setState({
      loadingText: true,
    });

    UserService.getConfig("App.thanhtoan,MA_QRCODE_NGAN_HANG,tdx_giaohang")
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
          van_chuyen: data.data[2]?.Value ? data.data[2]?.Value.split(",") : [],
        });
      })
      .catch((error) => console.log(error));
  }

  getOrderAll = () => {
    this.setState(() => ({ loading: true }));
    UserService.getOrderAll2()
      .then((response) => {
        const data = response.data;
        const TongNo = data
          ? data.reduce(
              (n, { thanhtoan }) =>
                n +
                Math.abs(
                  thanhtoan.tong_gia_tri_dh -
                    thanhtoan.thanh_toan_tien -
                    thanhtoan.thanh_toan_vi -
                    thanhtoan.thanh_toan_ao
                ),
              0
            )
          : 0;
        let newData = [...this.state.data];
        newData.map((x, index) => {
          if (x.key === "all") {
            newData[index].items = data || [];
          }
          if (x.key === "pending") {
            newData[index].items =
              data && data.length > 0
                ? data.filter((x) => x.Status === "user_sent")
                : [];
          }
          if (x.key === "cancel") {
            newData[index].items =
              data && data.length > 0
                ? data.filter((x) => x.Status === "cancel")
                : [];
          }
          if (x.key === "finish") {
            newData[index].items =
              data && data.length > 0
                ? data.filter((x) => x.Status === "finish")
                : [];
          }
        });
        this.setState({
          arrOder: data,
          loading: false,
          TongNo: TongNo,
          data: newData,
          init: newData,
          list: data,
        });
      })
      .catch((er) => console.log(er));
  };
  
  onFilter = (values) => {
    const { init, data, list } = this.state;
    if (!values.OrderID && !values.Desc) {
      this.setState({
        isFilter: false,
        data: init,
        filters: values,
        active: "all",
      });
    } else {
      let newData = JSON.parse(JSON.stringify(data));
      let newList = JSON.parse(JSON.stringify(list));
      
      if (values.OrderID) {
        newList = newList.filter((x) => x.ID === Number(values.OrderID));
      }
      if (values.Desc) {
        newList = newList.filter((x) => x.Desc === values.Desc);
      }
      newData.map((x, index) => {
        if (x.key === "all") {
          newData[index].items = newList || [];
        }
        if (x.key === "pending") {
          newData[index].items =
            newList && newList.length > 0
              ? newList.filter((x) => x.Status === "user_sent")
              : [];
        }
        if (x.key === "cancel") {
          newData[index].items =
            newList && newList.length > 0
              ? newList.filter((x) => x.Status === "cancel")
              : [];
        }
        if (x.key === "finish") {
          newData[index].items =
            newList && newList.length > 0
              ? newList.filter((x) => x.Status === "finish")
              : [];
        }
      });
      this.setState({
        isFilter: false,
        data: newData,
        filters: values,
        active: "all",
      });
    }
  };

  formatDateFull = (data) => {
    const dateSplit = data.split("T");
    return dateSplit[1] + " " + dateSplit[0];
  };

  checkStatus = (item) => {
    if (item.Status === "finish") {
      return "success";
    }
    if (item.Status === "cancel" && item.IsReturn !== 0) {
      return "primary";
    }
    if (item.Status === "cancel") {
      return "danger";
    }
    return "warning";
  };

  async loadRefresh(done) {
    await this.getOrderAll();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  }

  render() {
    const {
      filters,
      loading,
      loadingText,
      textPay,
      TongNo,
      Banks,
      MaND,
      data,
      active,
      isFilter,
      van_chuyen,
    } = this.state;

    return (
      <Page
        noToolbar
        onPtrRefresh={this.loadRefresh.bind(this)}
        ptr
        infiniteDistance={50}
        className="page-order-lists"
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() => {
                  this.$f7router.navigate(`/profile/`);
                  // this.$f7router.back();
                }}
              >
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">
                Đơn hàng
                {TongNo ? (
                  <span className="pl-2px font-size-sm">
                    {" "}
                    - Nợ {formatPriceVietnamese(TongNo)}
                  </span>
                ) : (
                  ""
                )}
              </span>
            </div>
            <div className="page-navbar__noti">
              <Link
                noLinkClass
                onClick={() => this.setState({ isFilter: true })}
                style={{
                  fontSize: "25px",
                }}
              >
                <i className="las la-filter"></i>
              </Link>
            </div>
          </div>
          <Subnavbar className="subnavbar-prod">
            <MenuOrder
              data={data}
              active={active}
              onChange={(val) => this.setState({ active: val.key })}
            />
          </Subnavbar>
        </Navbar>
        <div className="page-render no-bg p-0 h-100">
          <div className="page-order h-100">
            <div className="page-order__list p-0 h-100">
              {loading && (
                <>
                  {Array(5)
                    .fill()
                    .map((item, index) => (
                      <Link key={index} href="" noLinkClass className="item">
                        <div className="item-header">
                          <i className="las la-dolly"></i>
                          <div className="text">
                            <div className="date">
                              <Skeleton width={60} />
                            </div>
                            <div className={`status`}>
                              <Skeleton width={60} />
                            </div>
                          </div>
                        </div>
                        <div className="item-body">
                          <div className="list-sub">
                            {Array(index + 2)
                              .fill()
                              .map((sub, idx) => (
                                <div className="list-sub-item" key={idx}>
                                  <div className="img">
                                    <Skeleton width={60} height={60} />
                                  </div>
                                  <div className="text">
                                    <Skeleton count={2} />
                                    <div className="text-count">
                                      <Skeleton width={70} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className="item-footer">
                          <div className="content-item">
                            <span>Tổng đơn hàng :</span>
                            <span className="price text-red">
                              <Skeleton width={60} />
                            </span>
                          </div>
                          <div className="content-item">
                            <span>Đã thanh toán :</span>
                            <span className="price">
                              <Skeleton width={60} />
                            </span>
                            <span className="px">,</span>
                            <span>Còn nợ :</span>
                            <span className="price">
                              <Skeleton width={60} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </>
              )}
              <Tabs animated>
                {!loading && (
                  <>
                    {data &&
                      data.map((x, i) => (
                        <Tab id={x.key} tabActive={x.key === active} key={i}>
                          {x?.items?.length > 0 ? (
                            x?.items.map((item, index) => (
                              <Link
                                key={index}
                                href=""
                                noLinkClass
                                className="item"
                              >
                                <div className="item-header">
                                  <i className="las la-dolly"></i>
                                  <div className="text">
                                    <div className="date">
                                      {this.formatDateFull(item.OrderDate)}
                                    </div>
                                    <div
                                      className={
                                        `status ` + this.checkStatus(item)
                                      }
                                    >
                                      {item.IsReturn !== 0 &&
                                      item.Status === "cancel"
                                        ? "Trả lại"
                                        : item.StatusText === "Mới gửi"
                                        ? "Đang xử lý"
                                        : item.StatusText}
                                    </div>
                                  </div>
                                </div>
                                <div className="item-body">
                                  <div className="list-sub">
                                    {item.Items &&
                                      item.Items.map((sub, idx) => (
                                        <div
                                          className="list-sub-item"
                                          key={idx}
                                        >
                                          <div
                                            className={clsx(
                                              "img",
                                              window?.GlobalConfig?.APP
                                                ?.UIBase && "d-none"
                                            )}
                                          >
                                            <img
                                              src={checkImageProduct(
                                                sub.ProdThumb
                                              )}
                                            />
                                          </div>
                                          <div
                                            className={clsx(
                                              "text",
                                              window?.GlobalConfig?.APP
                                                ?.UIBase && "w-100 pl-0"
                                            )}
                                          >
                                            <div className="text-name">
                                              {sub.ProdTitle}
                                            </div>
                                            <div className="text-count">
                                              SL <b>x{sub.Qty}</b>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                                {item.Desc && (
                                  <div
                                    className="d--f ai--c"
                                    style={{
                                      borderTop: "1px solid #e8e8e8",
                                      padding: "10px",
                                    }}
                                  >
                                    <i
                                      className="las la-shipping-fast"
                                      style={{
                                        fontSize: "22px",
                                        color: "var(--ezs-color)",
                                      }}
                                    ></i>
                                    <div className="pl-10px">{item.Desc}</div>
                                  </div>
                                )}

                                <div className="item-footer">
                                  <div className="content-item">
                                    <span>Tổng đơn hàng :</span>
                                    <span className="price text-red">
                                      {formatPriceVietnamese(item.ToPay)}
                                      <b>₫</b>
                                    </span>
                                  </div>
                                  {item.Status !== "cancel" && (
                                    <div className="content-item">
                                      {/* <span>Đã thanh toán :</span>
                          <span className="price">
                            {formatPriceVietnamese(item.Payed)}
                            <b>₫</b>
                          </span> */}
                                      {item.Status === "finish" && (
                                        <React.Fragment>
                                          {item.thanhtoan.thanh_toan_tien >
                                            0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>Thanh toán thực tế :</span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan
                                                      .thanh_toan_tien
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          {item.thanhtoan.thanh_toan_vi > 0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>
                                                Điểm thưởng + Thẻ tiền :
                                              </span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan.thanh_toan_vi
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          {item.thanhtoan.hoan_vi_tra_hang >
                                            0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>
                                                Hoàn ví khi trả hàng :
                                              </span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan
                                                      .hoan_vi_tra_hang
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          {item.thanhtoan.hoan_vi_ket_thuc_the >
                                            0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>
                                                Hoàn ví khi kết thúc thẻ :
                                              </span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan
                                                      .hoan_vi_ket_thuc_the
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          {item.thanhtoan
                                            .ket_thuc_the_hoan_tien > 0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>
                                                Kết thúc thẻ hoàn tiền :
                                              </span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan
                                                      .ket_thuc_the_hoan_tien
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          {item.thanhtoan.ket_thuc_the_hoan_vi >
                                            0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>
                                                Kết thúc thẻ hoàn ví :
                                              </span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan
                                                      .ket_thuc_the_hoan_vi
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          {/* {item.thanhtoan.thanh_toan_ao > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Thanh toán ảo :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(item.thanhtoan.thanh_toan_ao)
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )} */}
                                          {item.thanhtoan.tra_hang_hoan_tien >
                                            0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>Trả hàng hoàn tiền :</span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan
                                                      .tra_hang_hoan_tien
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          {item.thanhtoan.tra_hang_hoan_vi >
                                            0 && (
                                            <React.Fragment>
                                              <span className="px">,</span>
                                              <span>Trả hàng ví :</span>
                                              <span className="price">
                                                {formatPriceVietnamese(
                                                  Math.abs(
                                                    item.thanhtoan
                                                      .tra_hang_hoan_vi
                                                  )
                                                )}
                                                <b>₫</b>
                                              </span>
                                            </React.Fragment>
                                          )}
                                          <span className="px">,</span>
                                        </React.Fragment>
                                      )}
                                      <span>Còn nợ :</span>
                                      <span className="price">
                                        {formatPriceVietnamese(
                                          Math.abs(
                                            item.thanhtoan.tong_gia_tri_dh -
                                              item.thanhtoan.thanh_toan_tien -
                                              item.thanhtoan.thanh_toan_vi -
                                              item.thanhtoan.thanh_toan_ao
                                          )
                                        )}
                                        <b>₫</b>
                                      </span>
                                      <div className="btn-div">
                                        {item?.Status === "user_sent" && item?.ToPayClient > 0 ? (
                                          <Button
                                            sheetOpen={`.demo-sheet-${item.ID}`}
                                            className="show-more"
                                          >
                                            Thanh toán
                                          </Button>
                                        ) : <></>}
                                      </div>
                                    </div>
                                  )}
                                  <SheetOrder
                                    item={item}
                                    textPay={textPay}
                                    loadingText={loadingText}
                                    Banks={Banks}
                                    MaND={MaND}
                                  />
                                </div>
                              </Link>
                            ))
                          ) : (
                            <PageNoData text="Không có dữ liệu" />
                          )}
                        </Tab>
                      ))}
                  </>
                )}
              </Tabs>
            </div>
          </div>
        </div>
        <OrderFilter
          opened={isFilter}
          onHide={() => this.setState({ isFilter: false })}
          van_chuyen={van_chuyen}
          filters={filters}
          onSubmit={this.onFilter}
        />
        {/* <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar> */}
      </Page>
    );
  }
}
