export const getHealth = (_req, res) => {
  res.json({
    phase: "foundation",
    service: "library-management-server",
    status: "ok"
  });
};
