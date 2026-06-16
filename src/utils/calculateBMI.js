const calculateBMI = (height, weight) => {
  const heightInMeters = height / 100;

  const bmi = weight / (heightInMeters * heightInMeters);

  let category;

  if (bmi < 18.5) {
    category = "Underweight";
  } else if (bmi < 25) {
    category = "Normal";
  } else if (bmi < 30) {
    category = "Overweight";
  } else {
    category = "Obese";
  }

  return {
    bmi: Number(bmi.toFixed(2)),
    category,
  };
};

export default calculateBMI;