import { Cart } from "../models/cart-model";
import { Product } from "../models/product-model";
import { CartInterface } from "../types/models/cart-type-model";
import { ApiError } from "../utils/apiError";
import { User } from "../models/user-model";
import mongoose from "mongoose";
import items from "razorpay/dist/types/items";

const addToCart = async (
  user_id: string,
  product_id: string,
  quantity: number
): Promise<CartInterface> => {
  const product = await Product.findById(product_id);
  if (!product) {
    throw new ApiError(404, "Product not found", "");
  }
  let price = product.price;
  let cart = await Cart.findOne({ user: user_id });
  const cartItem = {
    product_Id: product.id,
    product_name: product.productName,
    quantity,
    price,
  };
  if (cart) {
    const existingIndex = cart.cartItem.findIndex(
      (item: any) => item.product_Id.toString() === product_id
    );
    if (existingIndex > -1) {
      cart.cartItem[existingIndex].quantity += quantity;
    } else {
      cart.cartItem.push(cartItem);
    }
    cart.subTotal = cart.cartItem.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );
    await cart.save();
    return cart;
  }
  cart = await Cart.create({
    user: user_id,
    cartItem: [cartItem],
    subTotal: price * quantity,
  });
  return cart;
};

const getCartItem = async (user_id: string): Promise<object> => {
  const cart = await Cart.find({ user: user_id });
  console.log(cart);
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
): Promise<any> => {
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
                  {
                    $eq: [
                      "$$item.product_Id",
                      new mongoose.Types.ObjectId(product_Id),
                    ],
                  },
                  {
                    $mergeObjects: ["$$item", { quantity: deltaNum }],
                  },
                  "$$item",
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          subTotal: {
            $sum: {
              $map: {
                input: "$cartItem",
                as: "item",
                in: {
                  $multiply: ["$$item.quantity", "$$item.price"],
                },
              },
            },
          },
        },
      },
    ],
    option
  );
  await cart?.save();
  return cart;
};

const removeItemFromCart = async (
  cart_id: string,
  product_Id: string
): Promise<any> => {
  const cart = await Cart.findOne({ _id: cart_id });
  // console.log(cart)
  if (cart) {
    const productObjectId = new mongoose.Types.ObjectId(product_Id);
    console.log(productObjectId);
    cart.cartItem = cart.cartItem.filter(
      (item: any) => !item.product_Id.equals(productObjectId)
    );
    cart.subTotal = cart.cartItem.reduce(
      (total: number, item: any) => total + item.quantity * item.price,
      0
    );
    await cart.save();
  }
  return cart;
};

export { addToCart, getCartItem, updateCart, removeItemFromCart };
