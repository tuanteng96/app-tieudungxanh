import React from "react";
import { SERVER_APP } from "../../../../constants/config";
import { checkSale, formatPriceVietnamese } from "../../../../constants/format";
import { Link } from "framework7-react";
import RenderTagsProd from "../../../shop/components/RenderTagsProd";
import { TruncateLines } from "react-truncate-lines";

export default class ProductItem extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { item, source } = this.props;
    return (
      <Link href={"/shop/detail/" + item.id} className="page-shop__list-item">
        <div className="page-shop__list-img">
          <RenderTagsProd status={item?.source?.Status} />
          <img
            src={SERVER_APP + "/Upload/image/" + item.photo}
            alt={item.title}
          />
          {checkSale(source.SaleBegin, source.SaleEnd, item.pricesale) &&
            source.IsDisplayPrice !== 0 && (
              <div
                className="position-absolute top-0 right-0"
                style={{
                  background: "rgba(255,233,122)",
                  color: "rgba(236,56,20)",
                  padding: "1px 8px",
                  borderRadius: "5px",
                  fontWeight: "500",
                  fontSize: "12px",
                }}
              >
                -{100 - Math.round((item.pricesale / item.price) * 100)}%
              </div>
            )}
        </div>
        <div className="page-shop__list-text">
          <h3
            className="w-100"
            style={{
              height: "40px",
            }}
          >
            <TruncateLines lines={2} ellipsis={<span>...</span>}>
              {item.title}
            </TruncateLines>
          </h3>

          <div
            className={
              "page-shop__list-price " +
              (checkSale(source.SaleBegin, source.SaleEnd, item.pricesale) ===
              true
                ? "sale"
                : "")
            }
          >
            {source.IsDisplayPrice !== 0 ? (
              <>
                <span className="price">
                  <b>₫</b>
                  {formatPriceVietnamese(item.price)}
                </span>
                <span className="price-sale">
                  <b>₫</b>
                  {formatPriceVietnamese(item.pricesale)}
                </span>
              </>
            ) : (
              <span className="price">Liên hệ</span>
            )}
          </div>
          {source?.DIEM ? (
            <div className="mt-8px" style={{ color: "#000", fontSize: "14px" }}>
              <span
                className="bg-danger text-white px-5px mr-5px"
                style={{
                  fontFamily: "Archivo Narrow",
                  borderRadius: "3px",
                  fontWeight: "500",
                }}
              >
                -{source?.DIEM}%
              </span>
              từ điểm thưởng
            </div>
          ) : (
            <></>
          )}
        </div>
      </Link>
    );
  }
}
