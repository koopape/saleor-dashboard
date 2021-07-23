import { Card, TableBody } from "@material-ui/core";
import CardMenu from "@saleor/components/CardMenu";
import CardSpacer from "@saleor/components/CardSpacer";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import { OrderDetailsFragment } from "@saleor/fragments/types/OrderDetailsFragment";
import { mergeRepeatedOrderLines } from "@saleor/orders/utils/data";
import { makeStyles } from "@saleor/theme";
import React from "react";
import { useIntl } from "react-intl";

import { maybe, renderCollection } from "../../../misc";
import { FulfillmentStatus } from "../../../types/globalTypes";
import { OrderDetails_order_fulfillments } from "../../types/OrderDetails";
import TableHeader from "../OrderProductsCardElements/OrderProductsCardHeader";
import TableLine from "../OrderProductsCardElements/OrderProductsTableRow";
import CardTitle from "../OrderReturnPage/OrderReturnRefundItemsCard/CardTitle";
import ActionButtons from "./ActionButtons";
import ExtraInfoLines from "./ExtraInfoLines";
import { messages } from "./messages";

const useStyles = makeStyles(
  () => ({
    table: {
      tableLayout: "fixed"
    }
  }),
  { name: "OrderFulfillment" }
);

interface OrderFulfilledProductsCardProps {
  fulfillment: OrderDetails_order_fulfillments;
  fulfillmentAllowUnpaid: boolean;
  order?: OrderDetailsFragment;
  onOrderFulfillmentApprove: () => void;
  onOrderFulfillmentCancel: () => void;
  onTrackingCodeAdd: () => void;
  onRefund: () => void;
}

const OrderFulfilledProductsCard: React.FC<OrderFulfilledProductsCardProps> = props => {
  const {
    fulfillment,
    fulfillmentAllowUnpaid,
    order,
    onOrderFulfillmentApprove,
    onOrderFulfillmentCancel,
    onTrackingCodeAdd,
    onRefund
  } = props;
  const classes = useStyles(props);

  const intl = useIntl();

  if (!fulfillment) {
    return null;
  }

  const getLines = () => {
    const statusesToMergeLines = [
      FulfillmentStatus.REFUNDED,
      FulfillmentStatus.REFUNDED_AND_RETURNED,
      FulfillmentStatus.RETURNED,
      FulfillmentStatus.REPLACED
    ];

    if (statusesToMergeLines.includes(fulfillment?.status)) {
      return mergeRepeatedOrderLines(fulfillment.lines);
    }

    return fulfillment?.lines || [];
  };

  return (
    <>
      <Card>
        <CardTitle
          withStatus
          lines={fulfillment?.lines}
          fulfillmentOrder={fulfillment?.fulfillmentOrder}
          status={fulfillment?.status}
          orderNumber={order?.number}
          toolbar={
            maybe(() => fulfillment.status) === FulfillmentStatus.FULFILLED && (
              <CardMenu
                menuItems={[
                  {
                    label: intl.formatMessage(messages.cancelFulfillment),
                    onSelect: onOrderFulfillmentCancel,
                    testId: "cancelFulfillmentButton"
                  }
                ]}
              />
            )
          }
        />
        <ResponsiveTable className={classes.table}>
          <TableHeader />
          <TableBody>
            {renderCollection(getLines(), line => (
              <TableLine line={line} />
            ))}
          </TableBody>
          <ExtraInfoLines fulfillment={fulfillment} />
        </ResponsiveTable>
        <ActionButtons
          status={fulfillment?.status}
          trackingNumber={fulfillment?.trackingNumber}
          orderIsPaid={order?.isPaid}
          fulfillmentAllowUnpaid={fulfillmentAllowUnpaid}
          onTrackingCodeAdd={onTrackingCodeAdd}
          onRefund={onRefund}
          onApprove={onOrderFulfillmentApprove}
        />
      </Card>
      <CardSpacer />
    </>
  );
};

export default OrderFulfilledProductsCard;
