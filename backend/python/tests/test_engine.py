import unittest

from workflow_savings_calculator_backend.engine import DOMAIN_ROWS, PRODUCT_SLUG, build_release_packet, summarize_rows


class BackendEngineTests(unittest.TestCase):
    def test_release_packet_scores_approved_payload(self):
        payload = {"rows": [{"label": row, "score": 95, "evidence": f"evidence for {row}", "approved": True} for row in DOMAIN_ROWS]}
        packet = build_release_packet(payload)
        self.assertEqual(packet["product"]["slug"], PRODUCT_SLUG)
        self.assertEqual(packet["score"]["score"], 95)
        self.assertTrue(packet["score"]["approved"])
        self.assertEqual(packet["score"]["coverage"], 100)
        self.assertRegex(packet["release_hash"], r"^[0-9a-f]{16}$")

    def test_missing_evidence_blocks_approval(self):
        packet = build_release_packet({"rows": []})
        self.assertFalse(packet["score"]["approved"])
        self.assertGreater(len(packet["score"]["warnings"]), 0)
        self.assertEqual(len(summarize_rows({"rows": []})), len(DOMAIN_ROWS))


if __name__ == "__main__":
    unittest.main()


class ServerModuleTests(unittest.TestCase):
    def test_health_handler_exists(self):
        from workflow_savings_calculator_backend.server import Handler
        self.assertTrue(hasattr(Handler, "do_GET"))
        self.assertTrue(hasattr(Handler, "do_POST"))
