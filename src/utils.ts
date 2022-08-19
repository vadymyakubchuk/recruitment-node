export const handleError = (error) => {
  if (error?.status === 500) {
    console.error(error);
  }

  throw error;
};
