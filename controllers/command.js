import command from "../Models/command.js"
import restaurant from "../Models/restaurant.js"

export const laCommande = async (req, res) => {
  const { id } = req.params
  const { platsCommand, clientId, clientName, clientImage, total, status } =
    req.body
  console.log(clientImage)
  try {
    const newCommande = await command.create({
      clientId: clientId,
      restaurantId: id,
      commandes: platsCommand,
      clientName: clientName,
      total: total,
      clientImage: clientImage,
      status: status,
    })
    await newCommande.save()
    const { commandes } = await restaurant.findById(id)
    const updatedRestaurant = await restaurant.findByIdAndUpdate(
      id,
      { commandes: [...commandes, newCommande] },
      { new: true }
    )
    res.status(200).json(newCommande)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const updateCommand = async (req, res) => {
  const { id } = req.params
  const { commandId } = req.body
  console.log(commandId)
  const { status } = req.body
  try {
    const updatedCommand = await command.findByIdAndUpdate(
      commandId,
      { status: status },
      { new: true }
    )
    const { commandes } = await restaurant.findById(id)

    const newcommands = commandes.map(item =>
      item?._id == commandId ? updatedCommand : item
    )
    await restaurant.findByIdAndUpdate(
      id,
      { commandes: newcommands },
      { new: true }
    )
    res.status(200).json(updatedCommand)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const deleteCommand = async (req, res) => {
  const { id } = req.params
  const { commandId } = req.body
  console.log(commandId)
  console.log(id)
  try {
    await command.findByIdAndDelete(commandId, {
      new: true,
    })
    const { commandes } = await restaurant.findById(id)

    const newcommands = commandes.filter(item => item._id != commandId)
    await restaurant.findByIdAndUpdate(
      id,
      { commandes: newcommands },
      { new: true }
    )
    res.status(200).json(commandId)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// get Restaurant Commandes
export const commandes = async (req, res) => {
  const { id } = req.params
  try {
    const { commandes } = await restaurant.findById(id)
    return res.status(200).json(commandes)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
// get Client Command
export const clientCommand = async (req, res) => {
  const { id } = req.params
  try {
    const clientCommand = await command.findOne({ clientId: id })
    return res.status(200).json(clientCommand)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
export const SpecifiCclientCommand = async (req, res) => {
  const { id } = req.params
  try {
    const clientCommand = await command.findById(id)
    return res.status(200).json(clientCommand)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
