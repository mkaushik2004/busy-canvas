const ErrorResponse = require('../utils/errorResponse');
const { dbHelper } = require('../database/database');

// @desc    Get all artworks
// @route   GET /api/gallery
// @access  Public
const getGallery = async (req, res, next) => {
    try {
        const artworks = await Gallery.find({ status: 'published' })
            .populate('artist', 'fullName username profileImage')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            count: artworks.length,
            data: artworks
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single artwork
// @route   GET /api/gallery/:id
// @access  Public
const getArtwork = async (req, res, next) => {
    try {
        const artwork = await Gallery.findById(req.params.id)
            .populate('artist', 'fullName username profileImage');

        if (!artwork) {
            return next(new ErrorResponse(`Artwork not found with id of ${req.params.id}`, 404));
        }

        // Increment views
        await artwork.incrementViews();

        res.status(200).json({
            status: 'success',
            data: artwork
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new artwork
// @route   POST /api/gallery
// @access  Private
const createArtwork = async (req, res, next) => {
    try {
        req.body.artist = req.user.id;
        const artwork = await Gallery.create(req.body);

        res.status(201).json({
            status: 'success',
            data: artwork
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update artwork
// @route   PUT /api/gallery/:id
// @access  Private
const updateArtwork = async (req, res, next) => {
    try {
        let artwork = await Gallery.findById(req.params.id);

        if (!artwork) {
            return next(new ErrorResponse(`Artwork not found with id of ${req.params.id}`, 404));
        }

        artwork = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: artwork
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete artwork
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteArtwork = async (req, res, next) => {
    try {
        const artwork = await Gallery.findById(req.params.id);

        if (!artwork) {
            return next(new ErrorResponse(`Artwork not found with id of ${req.params.id}`, 404));
        }

        await artwork.remove();

        res.status(200).json({
            status: 'success',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search artworks
// @route   GET /api/gallery/search
// @access  Public
const searchArtwork = async (req, res, next) => {
    try {
        const { q, category, style, medium, minPrice, maxPrice } = req.query;
        
        const filters = {};
        if (category) filters.category = category;
        if (style) filters.style = style;
        if (medium) filters.medium = medium;
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = parseFloat(minPrice);
            if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
        }

        const artworks = await Gallery.search(q || '', filters);

        res.status(200).json({
            status: 'success',
            count: artworks.length,
            data: artworks
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Like/unlike artwork
// @route   POST /api/gallery/:id/like
// @access  Private
const likeArtwork = async (req, res, next) => {
    try {
        const artwork = await Gallery.findById(req.params.id);

        if (!artwork) {
            return next(new ErrorResponse(`Artwork not found with id of ${req.params.id}`, 404));
        }

        await artwork.toggleLike(req.user.id);

        res.status(200).json({
            status: 'success',
            data: artwork
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to artwork
// @route   POST /api/gallery/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
    try {
        const artwork = await Gallery.findById(req.params.id);

        if (!artwork) {
            return next(new ErrorResponse(`Artwork not found with id of ${req.params.id}`, 404));
        }

        await artwork.addComment(req.user.id, req.body.content);

        res.status(200).json({
            status: 'success',
            data: artwork
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve comment
// @route   PUT /api/gallery/:id/comments/:commentId/approve
// @access  Private
const approveComment = async (req, res, next) => {
    try {
        const artwork = await Gallery.findById(req.params.id);

        if (!artwork) {
            return next(new ErrorResponse(`Artwork not found with id of ${req.params.id}`, 404));
        }

        await artwork.approveComment(req.params.commentId);

        res.status(200).json({
            status: 'success',
            data: artwork
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured artworks
// @route   GET /api/gallery/featured
// @access  Public
const getFeaturedArtwork = async (req, res, next) => {
    try {
        const artworks = await Gallery.getFeatured(10);

        res.status(200).json({
            status: 'success',
            count: artworks.length,
            data: artworks
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get artwork statistics
// @route   GET /api/gallery/stats/overview
// @access  Private
const getArtworkStats = async (req, res, next) => {
    try {
        const stats = await Gallery.aggregate([
            {
                $group: {
                    _id: null,
                    totalArtworks: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: { $size: '$likes' } },
                    totalComments: { $sum: { $size: '$comments' } },
                    averageViews: { $avg: '$views' },
                    forSale: { $sum: { $cond: [{ $eq: ['$isForSale', true] }, 1, 0] } },
                    sold: { $sum: { $cond: [{ $eq: ['$isSold', true] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: stats[0] || {
                totalArtworks: 0,
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
                averageViews: 0,
                forSale: 0,
                sold: 0
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGallery,
    getArtwork,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    searchArtwork,
    likeArtwork,
    addComment,
    approveComment,
    getFeaturedArtwork,
    getArtworkStats
}; 