import Wishlist from "../models/Wishlist.js";

export const addToWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const alreadyExists = wishlist.products.find(
      (p) => p.productId.toString() === productId
    );

    if (!alreadyExists) {
      wishlist.products.push({ productId });
      await wishlist.save();
    }

    res.status(200).json({ message: "Product added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to wishlist", error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.productId.toString() !== productId
      );
      await wishlist.save();
      res.status(200).json({ message: "Product removed from wishlist" });
    } else {
      res.status(404).json({ message: "Wishlist not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from wishlist", error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products.productId");

    if (!wishlist) {
      return res.status(200).json([]);
    }

    // Filter out any null productId (i.e., product deleted from DB)
    const validProducts = wishlist.products.filter(p => p.productId !== null);

    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts;
      await wishlist.save();
    }

    // Return only the product details
    res.status(200).json(validProducts.map(p => p.productId));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: err.message });
  }
};
