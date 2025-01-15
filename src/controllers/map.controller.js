const { pool } = require('../config/db.config');

const mapController = {
  // Get all piezometer points
  getMarkers: async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        'SELECT id_interno, "IDPiezometro", "TipoFuente", "X_UTM", "Y_UTM", "NombreComun" FROM piezometria'
      );
      
      const markers = result.rows.map(point => ({
        id: point.id_interno,
        coordinates: [point.X_UTM, point.Y_UTM],
        properties: {
          id_piezometro: point.IDPiezometro,
          tipo_fuente: point.TipoFuente,
          nombre: point.NombreComun
        }
      }));
      
      res.json(markers);
    } catch (error) {
      console.error('Error in getMarkers:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    } finally {
      if (client) client.release();
    }
  },

  // Get piezometer by ID
  getLocationById: async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const { id } = req.params;
      const result = await client.query(
        'SELECT * FROM piezometria WHERE id_interno = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Piezometer not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error in getLocationById:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    } finally {
      if (client) client.release();
    }
  },

  // Add new piezometer
  addMarker: async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const {
        idpiezometro,
        tipofuente,
        x_utm,
        y_utm,
        x_local,
        y_local,
        nombrecomun,
        red,
        cota,
        altptotoma,
        profundidad
      } = req.body;

      const result = await client.query(
        `INSERT INTO piezometria 
        ("IDPiezometro", "TipoFuente", "X_UTM", "Y_UTM", "X_Local", "Y_Local", 
         "NombreComun", "Red", "Cota", "AltPtoToma", "Profundidad")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [idpiezometro, tipofuente, x_utm, y_utm, x_local, y_local,
         nombrecomun, red, cota, altptotoma, profundidad]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error in addMarker:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    } finally {
      if (client) client.release();
    }
  },

  // Update piezometer
  updateMarker: async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const { id } = req.params;
      const {
        idpiezometro,
        tipofuente,
        x_utm,
        y_utm,
        x_local,
        y_local,
        nombrecomun,
        red,
        cota,
        altptotoma,
        profundidad
      } = req.body;

      const result = await client.query(
        `UPDATE piezometria 
        SET "IDPiezometro" = $1, "TipoFuente" = $2, "X_UTM" = $3, "Y_UTM" = $4,
            "X_Local" = $5, "Y_Local" = $6, "NombreComun" = $7, "Red" = $8,
            "Cota" = $9, "AltPtoToma" = $10, "Profundidad" = $11
        WHERE id_interno = $12
        RETURNING *`,
        [idpiezometro, tipofuente, x_utm, y_utm, x_local, y_local,
         nombrecomun, red, cota, altptotoma, profundidad, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Piezometer not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error in updateMarker:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    } finally {
      if (client) client.release();
    }
  },

  // Delete piezometer
  deleteMarker: async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const { id } = req.params;
      const result = await client.query(
        'DELETE FROM piezometria WHERE id_interno = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Piezometer not found' });
      }

      res.json({ message: 'Piezometer deleted successfully' });
    } catch (error) {
      console.error('Error in deleteMarker:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    } finally {
      if (client) client.release();
    }
  }
};

module.exports = mapController; 