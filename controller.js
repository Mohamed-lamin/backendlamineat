import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const categorySchema = mongoose.Schema({
  category_name: String,
  category_image: String,
})

const dishSchema = mongoose.Schema({
  dishname: String,
  categorie: String,
  description: String,
  price: Number,
  image: String,
  restaurantId: String,
})
const commandSchema = mongoose.Schema({
  clientId: String,
  restaurantId: String,
  clientName: String,
  clientImage: String,
  commandes: Array,
  total: String,
})

const restaurantSchema = mongoose.Schema({
  restaurant_name: String,
  description: String,
  image: String,
  lat: Number,
  long: Number,
  numero: Number,
  rue: String,
  ville: String,
  codepostal: Number,
  rating: Number,
  category: String,

  userId: String,
})
const TypeSchema = mongoose.Schema({
  type_name: String,
  description: String,
  restaurantsId: [String],
})

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  restaurantId: String,
  role: String,
})
// Client Schema
const clientSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  profileimage: String,
})
const type = mongoose.model("Type", TypeSchema)
const restaurant = mongoose.model("restaurant", restaurantSchema)
const dish = mongoose.model("dish", dishSchema)
const UserModal = mongoose.model("User", userSchema)
const client = mongoose.model("client", clientSchema)
const command = mongoose.model("commande", commandSchema)
const category = mongoose.model("category", categorySchema)

export const createType = async (req, res) => {
  const { type_name, description } = req.body

  try {
    const newType = await type.create({
      type_name,
      description,
    })
    await newType.save()
    return res.status(200).json({ message: "it is done" })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
// Singin in and up

const secret = "test"

export const signin = async (req, res) => {
  const { email, password } = req.body

  try {
    const oldUser = await UserModal.findOne({ email })

    if (!oldUser)
      return res.status(404).json({ message: "utilisateur n'existe pas" })

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password)

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Identifiants non valides" })

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "1h",
    })

    res.status(200).json({ result: oldUser, token })
  } catch (err) {
    res.status(500).json({ message: "une erreur est survenue" })
  }
}

export const signup = async (req, res) => {
  const { email, password, firstname, lastname } = req.body

  try {
    const oldUser = await UserModal.findOne({ email })

    if (oldUser)
      return res.status(400).json({ message: "utilisateur existe déja" })

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await UserModal.create({
      email,
      password: hashedPassword,
      name: `${firstname} ${lastname}`,
      role: "Manager",
    })

    const token = jwt.sign({ email: result.email, id: result._id }, secret, {
      expiresIn: "1h",
    })

    res.status(201).json({ result, token })
  } catch (error) {
    res.status(500).json({ message: "Une erreur est survenue" })

    console.log(error)
  }
}
// Ajouter un serveur
export const ajouterServeur = async (req, res) => {
  const { email, password, firstname, lastname, restaurantId } = req.body
  console.log(email)
  try {
    const oldUser = await UserModal.findOne({ email })

    if (oldUser)
      return res.status(400).json({ message: "le serveur existe déja" })

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await UserModal.create({
      email,
      password: hashedPassword,
      name: `${firstname} ${lastname}`,
      role: "Serveur",
      restaurantId: restaurantId,
    })

    res.status(201).json({ message: "le Serveur a bien été ajouter" })
  } catch (error) {
    res.status(500).json({ message: "Une erreur est survenue" })
  }
}
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Creating Restaurant
export const createRestaurant = async (req, res) => {
  const {
    restaurant_name,
    description,
    image,
    lat,
    long,
    numero,
    rue,
    ville,
    codepostal,
    rating,
    category,
  } = req.body

  const UserId = req.params.id

  try {
    const newRestaurant = await restaurant.create({
      restaurant_name,
      description,
      image,
      lat,
      long,
      numero,
      rue,
      ville,
      codepostal,
      rating,
      category,
    })
    await newRestaurant.save()

    const updateduser = await UserModal.findByIdAndUpdate(
      UserId,
      { _id: UserId, restaurantId: newRestaurant._id },
      { new: true }
    )
    await updateduser.save()

    return res.status(200).json(newRestaurant)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
// get the specific restaurant

export const getTheRestaurant = async (req, res) => {
  const { id } = req.params

  try {
    const theRestauant = await restaurant.findById(id)
    return res.status(200).json(theRestauant)
  } catch (error) {
    res.status(500).json(error.message)
  }
}
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurant.find()
    return res.status(200).json(restaurants)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

// Updating restaurant
export const updateRestaurant = async (req, res) => {
  const {
    restaurant_name,
    description,
    image,
    lat,
    long,
    numero,
    rue,
    ville,
    codepostal,
    rating,
    category,
    _id,
    id,
  } = req.body
  console.log(_id)
  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send(`pas de restaurant avec id : ${_id}`)
    const updatedRestaurant = {
      restaurant_name,
      description,
      image,
      lat,
      long,
      numero,
      rue,
      ville,
      codepostal,
      rating,
      category,
      _id: _id,
    }
    console.log(restaurant_name)
    await restaurant.findByIdAndUpdate(_id, updatedRestaurant, {
      new: true,
    })

    const newuser = await UserModal.findByIdAndUpdate(
      id,
      { restaurantUser: updatedRestaurant },
      { new: true }
    )
    return res.status(200).json({ result: newuser })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
// Creating Plats

export const createPlats = async (req, res) => {
  const { dishname, description, price, image } = req.body
  console.log(dishname, description, price, image)
  const { id } = req.params

  try {
    const createdPlat = await dish.create({
      dishname,
      description,
      price,
      image,
      restaurantId: id,
    })
    await createdPlat.save()
    return res.status(200).json(createdPlat)
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
}
// get All get Plats
export const getPlats = async (req, res) => {
  const { id } = req.params
  console.log(id)
  try {
    // const restaurantToDisplay = await restaurant.findById({ _id: id })
    // return res.status(200).json(restaurantToDisplay.dishes)
    const plats = await dish.find({ restaurantId: id })
    return res.status(200).json(plats)
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
}
// delete Plat
export const deletePlat = async (req, res) => {
  const { id } = req.params
  console.log(id)

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("plat pas trouvé")
    await dish.findByIdAndRemove(id)
    res.status(200).json({ message: "Plat supprimé avec succés" })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
// Update Plat

export const updatePlat = async (req, res) => {
  const { id } = req.params
  const { dishname, description, price, image } = req.body
  const { _id } = req.body
  console.log(_id)
  try {
    const dishToUpdate = await dish.findByIdAndUpdate(
      _id,
      { _id: _id, dishname, description, price, image },
      { new: true }
    )
    console.log(dishToUpdate)
    return res
      .status(200)
      .json({ _id: _id, dishname, description, price, image })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// CatList

export const CatList = async (req, res) => {
  const { id } = req.params
  const { listName } = req.body
  console.log(listName)

  try {
    const typeList = await type.findOne({ type_name: listName })
    typeList.restaurantsId.push(id)
    await typeList.save()
    return res.status(200).json(typeList)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const getCatList = async (req, res) => {
  try {
    const AllTypes = await type.find()
    return res.status(200).json(AllTypes)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
// Client singn in and up
export const clientSignin = async (req, res) => {
  const { email, password } = req.body

  try {
    const oldClient = await client.findOne({ email })

    if (!oldClient)
      return res.status(404).json({ message: "utilisateur n'existe pas" })

    const isPasswordCorrect = await bcrypt.compare(password, oldClient.password)

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Identifiants non valides" })

    const token = jwt.sign(
      { email: oldClient.email, id: oldClient._id },
      secret,
      {
        expiresIn: "1h",
      }
    )

    res.status(200).json({ result: oldClient, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const clientSignup = async (req, res) => {
  const { email, password, firstname, lastname, profileimage } = req.body

  try {
    const oldClient = await client.findOne({ email })

    if (oldClient)
      return res.status(400).json({ message: "utilisateur existe déja" })

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await client.create({
      email,
      password: hashedPassword,
      name: `${firstname} ${lastname}`,
      profileimage,
    })

    const token = jwt.sign({ email: result.email, id: result._id }, secret, {
      expiresIn: "1h",
    })

    res.status(201).json({ result, token })
  } catch (error) {
    res.status(500).json({ message: "Une erreur est survenue" })

    console.log(error)
  }
}
// create Commande
export const laCommande = async (req, res) => {
  const { id } = req.params
  const { platsCommand, clientId, clientName, clientImage, total } = req.body
  console.log(clientImage)
  try {
    const newCommande = await command.create({
      clientId: clientId,
      restaurantId: id,
      commandes: platsCommand,
      clientName: clientName,
      total: total,
      clientImage: clientImage,
    })
    await newCommande.save()
    res.status(200).json({ message: "its saved" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// get Commandes
export const commandes = async (req, res) => {
  const { id } = req.params
  try {
    const AllCommands = await command.find({ restaurantId: id })
    return res.status(200).json(AllCommands)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
// Create Categories

export const CreateCategory = async (req, res) => {
  const { dishname, image } = req.body
  console.log()
  try {
    const newCatego = await category.create({
      category_name: dishname,
      category_image: image,
    })
    await newCatego.save()
    return res.status(200).json({ message: "it is ok" })
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
// Fetch all Categories
export const getCategories = async (req, res) => {
  try {
    const allCategories = await category.find()
    return res.status(200).json(allCategories)
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
