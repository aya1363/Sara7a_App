export const findOne = async ({model ,filter={},select=' ',populate=[]}={}) => {
    return await model.findOne(filter).select(select).populate(populate)
}
export const create = async ({ model, data, options = { validateBeforeSave: true } }) => {
  if (Array.isArray(data)) {
    return await model.create(data, options); // already an array
  }
  return await model.create([data], options); // wrap single doc into array
};

export const findById = async ({model ,id ,select=' ',populate=[]}={}) => {
    return await model.findById(id).select(select).populate(populate)
}
export const updateOne = async ({model ,filter={}, data= [{}] ,options={runValidators:true , new:true}}={}) => {
    return await model.updateOne(filter , data,options)
}
export const findOneAndUpdate = async ({
    model,
    filter = {},
    select = ' ',
    populate = [],
    data = {},
    options = { runValidators: true, new: true }
} = {}) => {
    let query = model.findOneAndUpdate(
        filter,
        { ...data, $inc: { __v: 1 } },
        options
    ).select(select);

    if (populate.length) {
        query = query.populate(populate);
    }

    return await query;
}

export const deleteOne = async ({ model, filter = {} } = {}) => {
    return await model.deleteOne(filter)
}