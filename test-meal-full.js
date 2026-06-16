import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.models.js';
import MealPlan from './src/models/mealPlan.models.js';
import MealItem from './src/models/mealitem.models.js';

dotenv.config();

const base = 'http://localhost:3000/api/v1';

async function run() {
  await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.DB_NAME });

  const email = `meal_test_${Date.now()}@test.com`;
  const password = 'Password@123';

  const user = await User.create({
    fullName: 'Meal Test User',
    email,
    passwordHash: password,
    isVerified: true,
  });

  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200) throw new Error(`login failed: ${JSON.stringify(loginData)}`);

  const accessToken = loginData.accessToken;
  if (!accessToken) throw new Error('missing access token');

  const createRes = await fetch(`${base}/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: 'Healthy Breakfast',
      description: 'Eggs and toast',
      mealType: 'breakfast',
      items: [
        { foodName: 'Eggs', quantity: '2', calories: 150, protein: 12 },
        { foodName: 'Toast', quantity: '1', calories: 100, carbs: 20 },
      ],
    }),
  });
  const createData = await createRes.json();
  console.log('create', createRes.status, createData.message);
  const mealId = createData?.data?._id;
  if (!mealId) throw new Error('missing meal id');

  const listRes = await fetch(`${base}/meals`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const listData = await listRes.json();
  console.log('list', listRes.status, listData.data?.length);

  const getRes = await fetch(`${base}/meals/${mealId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const getData = await getRes.json();
  console.log('get', getRes.status, getData.data?.item?.length);

  const updateRes = await fetch(`${base}/meals/${mealId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title: 'Updated Breakfast', description: 'Eggs, toast and juice' }),
  });
  const updateData = await updateRes.json();
  console.log('update', updateRes.status, updateData.data?.title);

  const consumeRes = await fetch(`${base}/meals/${mealId}/consume`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const consumeData = await consumeRes.json();
  console.log('consume', consumeRes.status, consumeData.message);

  const historyRes = await fetch(`${base}/meals/history`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const historyData = await historyRes.json();
  console.log('history', historyRes.status, historyData.data?.length);

  const deleteRes = await fetch(`${base}/meals/${mealId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const deleteData = await deleteRes.json();
  console.log('delete', deleteRes.status, deleteData.message);

  console.log('remaining meals', await MealPlan.countDocuments({ user: user._id }));
  console.log('remaining items', await MealItem.countDocuments({ mealPlan: mealId }));

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
