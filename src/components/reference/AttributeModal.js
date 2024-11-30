const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  const payload = {
    ui_name: formData.ui_name,
    name: formData.name,
    type: formData.type,
    is_required: formData.is_required,
    use_image: formData.use_image,
    is_active: formData.is_active,
    scope: formData.scope,
    options: formData.options
  };

  try {
    const url = isEditMode 
      ? `http://localhost:5000/api/attributes/${attributeId}`
      : 'http://localhost:5000/api/attributes';
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await axios({
      method,
      url,
      data: payload
    });

    if (response.data.message === 'success') {
      toast.success(`Attribute ${isEditMode ? 'updated' : 'created'} successfully`);
      onSuccess(response.data.data);
      handleClose();
    }
  } catch (error) {
    toast.error(error.response?.data?.error || 'An error occurred');
  } finally {
    setIsSubmitting(false);
  }
}; 