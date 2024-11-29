// Add this function to handle product deletion
const handleDeleteProduct = async (productId) => {
  try {
    // Delete the product from the database
    await axios.delete(`http://localhost:5000/api/products/${productId}`);
    
    // Also delete the product image if it exists
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}/image`);
    } catch (imageError) {
      console.log('No image to delete or error deleting image:', imageError);
    }

    toast.success('Product deleted successfully');
    // Refresh the products list
    fetchProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    toast.error('Failed to delete product');
  }
}; 