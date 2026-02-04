import { Cart } from "../models/cart-model";
import { Product } from "../models/product-model";
import { CartInterface } from "../types/models/cart-type-model";
import { ApiError } from "../utils/apiError";
import { User } from "../models/user-model";
import mongoose from "mongoose";
import { types } from "util";

const addToCart = async (
  user_id: string,
  product_id: string,
  quantity: number
): Promise<CartInterface> => {
  const product = await Product.findById(product_id);
  if (!product) {
    throw new ApiError(404, "Product is not found", "");
  }
  const cart = await Cart.findOneAndUpdate(
    {
      user: user_id,
      "cartItem.product_Id": product_id,
    },
    {
      $inc: {
        "cartItem.$.quantity": quantity,
        subTotal: product.price * quantity,
      },
    },
    {
      new: true,
    }
  );
  if (cart) {
    return cart;
  }
  const price = product.price;
  const subTotal = product.price * quantity;
  const cartItem = await Cart.create({
    user: user_id,
    cartItem: [
      {
        product_Id: product_id,
        quantity,
        price,
      },
    ],
    subTotal,
  });

  await User.findByIdAndUpdate(
    { _id: user_id },
    { cart: cartItem?._id },
    { new: true }
  );

  return cartItem;
};

const getCartItem = async (user_id: string): Promise<object> => {
  const cart = await Cart.findOne({ user: user_id });
  if (!cart) {
    throw new ApiError(404, "No product found in cart", "");
  }
  const grandTotal = await Cart.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(user_id) },
    },
    {
      $group: {
        _id: "$user",
        grandTotal: {
          $sum: "$subTotal",
        },
      },
    },
  ]);
  return { cart, grandTotal };
};

const updateCart = async (
  cart_id: string,
  product_Id: string,
  deltaNum: number
) => {
  const query = {
    _id: cart_id,
    "cartItem.product_Id": product_Id,
  };
  const option = { new: true };

  const cart = await Cart.findOneAndUpdate(
    query,
    [
      {
        $set: {
          cartItem: {
            $map: {
              input: "$cartItem",
              as: "item",
              in: {
                $cond: [
                  { $eq: ["$$item.product_Id", product_Id] },
                  {
                    $mergeObjects: [
                      "$$item",
                      { quantity:deltaNum},
                    ],
                  },
                  "$$item",
                ],
              },
            },
          },
          subTotal: {
            $sum:{
              $map:{
                input:"$cartItem",
                as:"item",
                in:{
                  $multiply:[
                    "$$item.quantity",
                    "$$item.price"
                  ]
                }
              }
            }
          },
        },
      },
    ],
    option
  );
};

const removeItemFromCart = async (cart_id: string, product_Id: string) => {
  const cartListUpdate = await Cart.findOneAndUpdate(
    { _id: cart_id },
    [
      {
        $set: {
          subTotal: {
            $subtract: [
              "$subTotal",
              {
                $multiply: [
                  {
                    $first: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$cartItem",
                            as: "item",
                            cond: {
                              $eq: [
                                "$$item.productId",
                                new mongoose.Types.ObjectId(product_Id),
                              ],
                            },
                          },
                        },
                        as: "item",
                        in: "$$item.price",
                      },
                    },
                  },
                  {
                    $first: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$cartItem",
                            as: "item",
                            cond: {
                              $eq: [
                                "$$item.productId",
                                new mongoose.Types.ObjectId(product_Id),
                              ],
                            },
                          },
                          as: "item",
                          in: "$$item.quantity",
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
          cartItem: {
            $filter: {
              input: "$cartItem",
              as: "item",
              cond: {
                $ne: [
                  "$$item.productId",
                  new mongoose.Types.ObjectId(product_Id),
                ],
              },
            },
          },
        },
      },
    ],
    { new: true }
  );
  return cartListUpdate
};
export { addToCart, getCartItem, updateCart, removeItemFromCart };
