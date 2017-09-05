module Thesis.Random where
import System.Random
import Control.Monad.State

uniform :: (RandomGen s, MonadState s m) => Double -> Double -> m Double
uniform a b = state $ randomR (a, b)

bernoulli :: (RandomGen s, MonadState s m) => Double -> m Bool
bernoulli p = (< p) <$> uniform 0 1
